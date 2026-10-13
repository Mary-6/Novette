<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Mail;
use App\Http\Middleware\SessionAuth;
use App\Support\Admin;

/*
|--------------------------------------------------------------------------
| Novette API — Laravel port of server/src/index.js
| Reuses the same Postgres schema (Prisma table/column names, quoted).
|--------------------------------------------------------------------------
*/

$user = fn (Request $r) => $r->attributes->get('user');

$publicUser = fn ($u) => [
    'id' => $u->id,
    'name' => $u->name,
    'email' => $u->email,
    'role' => $u->role,
    'emailVerified' => !empty($u->emailVerifiedAt),
];

$requireAuth = function (Request $r) use ($user) {
    if (!$user($r)) {
        abort(response()->json(['error' => 'Authentication required'], 401));
    }
};
$requireAdmin = function (Request $r) use ($user) {
    if (!$user($r) || $user($r)->role !== 'admin') {
        abort(response()->json(['error' => 'Admin access required'], 403));
    }
};

$makeToken = function () {
    $raw = bin2hex(random_bytes(32));
    return [$raw, hash('sha256', $raw)];
};

$issueSession = function ($res, string $userId, bool $remember) {
    $days = $remember ? 30 : 1;
    $token = SessionAuth::jwtSign(
        ['sub' => $userId, 'jti' => bin2hex(random_bytes(16))],
        $days * 86400
    );
    DB::table('Session')->insert([
        'id' => 'c' . uniqid() . bin2hex(random_bytes(8)),
        'token' => $token,
        'userId' => $userId,
        'remember' => $remember,
        'expiresAt' => now()->addDays($days)->toDateTimeString(),
        'createdAt' => now()->toDateTimeString(),
    ]);
    return $res->withCookie(cookie('aw_session', $token, $days * 24 * 60, '/', null, request()->isSecure(), true, false, 'lax'));
};

$DEFAULT_TEMPLATES = [
    'order_confirm' => [
        'subject' => 'Order {{order.number}} confirmed — Novette Watches',
        'html' => '<p>Thank you, {{order.customerName}}.</p><p>Your order <b>{{order.number}}</b> totalling ${{order.total}} is confirmed. We will email tracking once your timepiece ships fully insured.</p>',
    ],
    'verify_email' => [
        'subject' => 'Verify your Novette Watches account',
        'html' => '<p>Welcome to Novette Watches, {{user.name}}.</p><p>Verify your email: <a href="{{link}}">Confirm account</a></p>',
    ],
    'reset_password' => [
        'subject' => 'Reset your Novette Watches password',
        'html' => '<p>Reset link (valid one hour): <a href="{{link}}">Reset password</a></p>',
    ],
    'order_shipped' => [
        'subject' => 'Your order {{order.number}} has shipped — Novette Watches',
        'html' => '<p>Good news, {{order.customerName}} — order <b>{{order.number}}</b> has shipped. Tracking: {{order.trackingNumber}}.</p>',
    ],
];

$mailTemplate = function (string $key, array $ctx) use ($DEFAULT_TEMPLATES) {
    $tpl = DB::table('EmailTemplate')->where('key', $key)->first();
    $subject = $tpl ? $tpl->subject : $DEFAULT_TEMPLATES[$key]['subject'];
    $html = $tpl ? $tpl->html : $DEFAULT_TEMPLATES[$key]['html'];
    $flat = [];
    foreach ($ctx as $k => $v) {
        if (is_object($v) || is_array($v)) {
            foreach ((array) $v as $kk => $vv) $flat["{$k}.{$kk}"] = $vv;
        } else {
            $flat[$k] = $v;
        }
    }
    foreach ($flat as $k => $v) {
        $subject = str_replace('{{' . $k . '}}', (string) $v, $subject);
        $html = str_replace('{{' . $k . '}}', (string) $v, $html);
    }
    return ['subject' => $subject, 'html' => $html];
};

$sendMail = function (string $to, string $subject, string $html) {
    try {
        Mail::send([], [], function ($m) use ($to, $subject, $html) {
            $m->to($to)->subject($subject)->html($html);
        });
    } catch (\Throwable $e) {
        \Log::warning("[mail] to={$to} subject={$subject} failed: {$e->getMessage()}");
    }
};

$getSettings = function () {
    $out = [];
    foreach (DB::table('SiteSetting')->get() as $row) {
        $out[$row->key] = json_decode($row->value, true);
    }
    return $out;
};

/* ---------- Catalogue ---------- */

Route::get('/watches', function (Request $r) {
    $q = DB::table('Watch')->where('inventory', '>', 0)->where('active', 1);
    if ($r->q) {
        $term = '%' . $r->q . '%';
        $q->where(function ($w) use ($term) {
            foreach (['model', 'reference', 'brandSlug', 'nickname'] as $f) {
                $w->orWhere($f, 'like', $term);
            }
        });
    }
    foreach (['brand' => 'brandSlug', 'type' => 'type', 'gender' => 'gender', 'condition' => 'condition'] as $p => $f) {
        if ($r->$p) $q->where($f, $r->$p);
    }
    if ($r->min || $r->max) {
        $q->whereBetween('price', [intval($r->min ?: 0), intval($r->max ?: 2000000000)]);
    }
    match ($r->sort) {
        'price-asc' => $q->orderBy('price'),
        'price-desc' => $q->orderByDesc('price'),
        'newest' => $q->orderByDesc('addedAt'),
        default => $q->orderByDesc('popularity'),
    };
    return $q->get()->map(fn ($w) => \App\Support\Catalog::decorate($w));
});

Route::get('/watches/{slug}', function (string $slug) {
    $w = DB::table('Watch')->where('slug', $slug)->where('active', 1)->first();
    if (!$w) return response()->json(['error' => 'Not found'], 404);
    return \App\Support\Catalog::decorate($w);
});

/* ---------- Auth ---------- */

Route::post('/auth/signup', function (Request $r) use ($publicUser, $issueSession, $makeToken, $mailTemplate, $sendMail) {
    $data = $r->validate([
        'name' => 'nullable|string|min:2',
        'email' => 'required|email',
        'password' => 'required|string|min:8',
        'remember' => 'boolean',
    ]);
    if (DB::table('User')->where('email', $data['email'])->exists()) {
        return response()->json(['error' => 'An account already exists for that email'], 409);
    }
    $id = 'c' . uniqid() . bin2hex(random_bytes(8));
    DB::table('User')->insert([
        'id' => $id,
        'name' => $data['name'] ?? explode('@', $data['email'])[0],
        'email' => $data['email'],
        'passwordHash' => Hash::make($data['password']),
        'role' => 'customer',
        'createdAt' => now()->toDateTimeString(),
    ]);
    [$raw, $hash] = $makeToken();
    DB::table('AuthToken')->insert([
        'id' => 'c' . uniqid() . bin2hex(random_bytes(8)),
        'userId' => $id,
        'kind' => 'verify_email',
        'tokenHash' => $hash,
        'expiresAt' => now()->addDay()->toDateTimeString(),
        'createdAt' => now()->toDateTimeString(),
    ]);
    $u = DB::table('User')->where('id', $id)->first();
    Admin::notify('customer', "New customer: {$u->name}", $u->email, '/admin/customers/' . $id);
    $t = $mailTemplate('verify_email', ['user' => $u, 'link' => env('APP_URL') . '/verify-email?token=' . $raw]);
    $sendMail($u->email, $t['subject'], $t['html']);
    $res = response()->json(['user' => $publicUser($u)], 201);
    return $issueSession($res, $id, $data['remember'] ?? true);
});

Route::post('/auth/login', function (Request $r) use ($publicUser, $issueSession) {
    $data = $r->validate([
        'email' => 'required|email',
        'password' => 'required|string|min:8',
        'remember' => 'boolean',
    ]);
    $u = DB::table('User')->where('email', $data['email'])->first();
    if (!$u || !Hash::check($data['password'], $u->passwordHash)) {
        return response()->json(['error' => 'Invalid email or password'], 401);
    }
    if (!($u->isActive ?? 1)) {
        return response()->json(['error' => 'This account has been deactivated. Contact support.'], 403);
    }
    $res = response()->json(['user' => $publicUser($u)]);
    return $issueSession($res, $u->id, $data['remember'] ?? true);
});

Route::post('/auth/logout', function (Request $r) {
    $token = $r->cookie('aw_session');
    if ($token) DB::table('Session')->where('token', $token)->delete();
    return response()->json(['ok' => true])->withCookie(cookie()->forget('aw_session'));
});

Route::get('/auth/me', function (Request $r) use ($user, $publicUser) {
    return ['user' => $user($r) ? $publicUser($user($r)) : null];
});

Route::post('/auth/forgot-password', function (Request $r) use ($makeToken, $mailTemplate, $sendMail) {
    $email = $r->input('email');
    if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $u = DB::table('User')->where('email', $email)->first();
        if ($u) {
            [$raw, $hash] = $makeToken();
            DB::table('AuthToken')->insert([
                'id' => 'c' . uniqid() . bin2hex(random_bytes(8)),
                'userId' => $u->id,
                'kind' => 'reset_password',
                'tokenHash' => $hash,
                'expiresAt' => now()->addHour()->toDateTimeString(),
                'createdAt' => now()->toDateTimeString(),
            ]);
            $t = $mailTemplate('reset_password', ['user' => $u, 'link' => env('APP_URL') . '/reset-password?token=' . $raw]);
            $sendMail($u->email, $t['subject'], $t['html']);
        }
    }
    return ['ok' => true];
});

Route::post('/auth/reset-password', function (Request $r) {
    $data = $r->validate(['token' => 'required|string', 'password' => 'required|string|min:8']);
    $hash = hash('sha256', $data['token']);
    $tok = DB::table('AuthToken')
        ->where('tokenHash', $hash)->where('kind', 'reset_password')
        ->whereNull('usedAt')->where('expiresAt', '>', now())->first();
    if (!$tok) return response()->json(['error' => 'Reset link is invalid or expired'], 400);
    DB::transaction(function () use ($tok, $data) {
        DB::table('User')->where('id', $tok->userId)
            ->update(['passwordHash' => Hash::make($data['password'])]);
        DB::table('AuthToken')->where('id', $tok->id)->update(['usedAt' => now()]);
        DB::table('Session')->where('userId', $tok->userId)->delete();
    });
    return ['ok' => true];
});

Route::post('/auth/verify-email', function (Request $r) {
    $hash = hash('sha256', (string) $r->input('token', ''));
    $tok = DB::table('AuthToken')
        ->where('tokenHash', $hash)->where('kind', 'verify_email')
        ->whereNull('usedAt')->where('expiresAt', '>', now())->first();
    if (!$tok) return response()->json(['error' => 'Verification link is invalid or expired'], 400);
    DB::transaction(function () use ($tok) {
        DB::table('User')->where('id', $tok->userId)->update(['emailVerifiedAt' => now()]);
        DB::table('AuthToken')->where('id', $tok->id)->update(['usedAt' => now()]);
    });
    return ['ok' => true];
});

/* ---------- Cart & wishlist ---------- */

Route::get('/cart', function (Request $r) use ($user, $requireAuth) {
    $requireAuth($r);
    return DB::table('CartItem')->where('userId', $user($r)->id)->get()->map(function ($i) {
        $w = DB::table('Watch')->where('id', $i->watchId)->first();
        $i->watch = $w ? \App\Support\Catalog::decorate($w) : null;
        return $i;
    });
});

Route::put('/cart', function (Request $r) use ($user, $requireAuth) {
    $requireAuth($r);
    $items = $r->input('items', []);
    DB::transaction(function () use ($items, $user, $r) {
        DB::table('CartItem')->where('userId', $user($r)->id)->delete();
        foreach ($items as $i) {
            DB::table('CartItem')->insert([
                'userId' => $user($r)->id,
                'watchId' => $i['watchId'],
                'qty' => min(10, max(1, intval($i['qty']))),
                'updatedAt' => now()->toDateTimeString(),
            ]);
        }
    });
    return ['ok' => true];
});

Route::get('/wishlist', function (Request $r) use ($user, $requireAuth) {
    $requireAuth($r);
    return DB::table('WishlistItem')->where('userId', $user($r)->id)->get()->map(function ($i) {
        $i->watch = DB::table('Watch')->where('id', $i->watchId)->first();
        return $i;
    });
});

Route::put('/wishlist', function (Request $r) use ($user, $requireAuth) {
    $requireAuth($r);
    $ids = $r->input('watchIds', []);
    DB::transaction(function () use ($ids, $user, $r) {
        DB::table('WishlistItem')->where('userId', $user($r)->id)->delete();
        foreach ($ids as $wid) {
            DB::table('WishlistItem')->insert([
                'userId' => $user($r)->id,
                'watchId' => $wid,
                'createdAt' => now()->toDateTimeString(),
            ]);
        }
    });
    return ['ok' => true];
});

/* ---------- Settings / shipping ---------- */

Route::get('/site-settings', function () use ($getSettings) {
    $s = $getSettings();
    return [
        'announcement' => $s['announcement'] ?? null,
        'contactEmail' => $s['contactEmail'] ?? null,
        'supportPhone' => $s['supportPhone'] ?? '+1 800 555 0148',
        'storeName' => $s['storeName'] ?? 'Novette Watches',
        'address' => $s['address'] ?? null,
        'socials' => $s['socials'] ?? [],
    ];
});

Route::get('/shipping-rates', function () use ($getSettings) {
    $s = $getSettings();
    return $s['shipping'] ?? [
        ['id' => 'courier', 'label' => 'Insured Courier', 'hint' => '3–5 business days', 'price' => 0],
        ['id' => 'express', 'label' => 'Express Overnight', 'hint' => 'Next business day', 'price' => 250],
    ];
});

/* ---------- Orders ---------- */

Route::post('/orders', function (Request $r) use ($user, $mailTemplate, $sendMail) {
    $data = $r->validate([
        'email' => 'required|email',
        'customerName' => 'required|string|min:2',
        'shippingMethod' => 'required|in:courier,express',
        'phone' => 'nullable|string|max:40',
        'promoCode' => 'nullable|string|max:64',
        'paymentMethod' => 'nullable|string',
        'address.address' => 'required|string|min:3',
        'address.city' => 'required|string',
        'address.zip' => 'required|string',
        'address.country' => 'required|string',
        'items' => 'required|array|min:1',
        'items.*.watchId' => 'required|string',
        'items.*.qty' => 'required|integer|min:1',
    ]);
    $order = DB::transaction(function () use ($data, $user, $r) {
        $subtotal = 0;
        $lines = [];
        foreach ($data['items'] as $item) {
            $w = DB::table('Watch')->where('id', $item['watchId'])->lockForUpdate()->first();
            if (!$w || !$w->active || $w->inventory < $item['qty']) {
                abort(response()->json(['error' => 'Out of stock: ' . $item['watchId']], 409));
            }
            DB::table('Watch')->where('id', $w->id)->update(['inventory' => $w->inventory - $item['qty']]);
            $unit = ($w->salePrice && $w->salePrice < $w->price) ? (int) $w->salePrice : (int) $w->price;
            $subtotal += $unit * $item['qty'];
            $lines[] = [
                'id' => 'c' . uniqid() . bin2hex(random_bytes(8)),
                'watchId' => $w->id,
                'model' => $w->model,
                'reference' => $w->reference,
                'brand' => $w->brandSlug,
                'qty' => $item['qty'],
                'price' => $unit,
            ];
        }
        $ship = ($subtotal > 5000 && $data['shippingMethod'] === 'courier')
            ? 0
            : ['courier' => 0, 'express' => 250][$data['shippingMethod']];
        $discount = 0;
        $promoCode = null;
        $autoPromos = DB::table('Promotion')->where('status', 'active')->where('kind', '!=', 'promo_code')
            ->where(fn ($q) => $q->whereNull('startDate')->orWhere('startDate', '<=', now()))
            ->where(fn ($q) => $q->whereNull('endDate')->orWhere('endDate', '>=', now()))->get();
        foreach ($lines as $l) {
            $best = 0;
            foreach ($autoPromos as $ap) {
                $ids = json_decode($ap->appliesTo ?: '[]', true) ?: [];
                if ($ids && !in_array($l['watchId'], $ids, true)) continue;
                $lineTotal = $l['price'] * $l['qty'];
                $d = $ap->type === 'fixed' ? min((int) $ap->value * $l['qty'], $lineTotal) : (int) round($lineTotal * min((int) $ap->value, 100) / 100);
                $best = max($best, $d);
            }
            $discount += $best;
        }
        if (!empty($data['promoCode'])) {
            $p = DB::table('Promotion')->where('code', strtoupper(trim($data['promoCode'])))->where('status', 'active')
                ->where(fn ($q) => $q->whereNull('startDate')->orWhere('startDate', '<=', now()))
                ->where(fn ($q) => $q->whereNull('endDate')->orWhere('endDate', '>=', now()))->first();
            if (!$p) abort(response()->json(['error' => 'Promo code is invalid or expired'], 422));
            $discount += $p->type === 'fixed' ? min((int) $p->value, $subtotal - $discount) : (int) round(($subtotal - $discount) * min((int) $p->value, 100) / 100);
            $promoCode = $p->code;
        }
        $oid = 'c' . uniqid() . bin2hex(random_bytes(8));
        $num = 'NV-' . random_int(100000, 999999);
        DB::table('Order')->insert([
            'id' => $oid,
            'number' => $num,
            'userId' => $user($r)->id ?? null,
            'email' => $data['email'],
            'status' => 'pending',
            'customerName' => $data['customerName'],
            'shippingMethod' => $data['shippingMethod'],
            'shippingPrice' => $ship,
            'subtotal' => $subtotal,
            'total' => $subtotal - $discount + $ship,
            'discount' => $discount,
            'promoCode' => $promoCode,
            'phone' => $data['phone'] ?? null,
            'paymentMethod' => $data['paymentMethod'] ?? 'none',
            'address' => json_encode($data['address']),
            'createdAt' => now()->toDateTimeString(),
            'updatedAt' => now()->toDateTimeString(),
        ]);
        foreach ($lines as &$l) $l['orderId'] = $oid;
        DB::table('OrderItem')->insert($lines);
        DB::table('OrderEvent')->insert(['id' => Admin::id(), 'orderId' => $oid, 'status' => 'pending', 'note' => 'Order placed', 'createdAt' => now()->toDateTimeString()]);
        $o = (array) DB::table('Order')->where('id', $oid)->first();
        $o['items'] = DB::table('OrderItem')->where('orderId', $oid)->get();
        return $o;
    });
    Admin::notify('order', "New order {$order['number']}", "{$order['customerName']} · $" . number_format($order['total']), '/admin/orders/' . $order['id']);
    foreach ($order['items'] as $it) Admin::checkStock($it->watchId);
    $t = $mailTemplate('order_confirm', ['order' => $order]);
    $sendMail($order['email'], $t['subject'], $t['html']);
    return response()->json(['order' => $order], 201);
});

Route::get('/orders', function (Request $r) use ($user, $requireAuth) {
    $requireAuth($r);
    return DB::table('Order')->where('userId', $user($r)->id)->orderByDesc('createdAt')->get()
        ->map(function ($o) {
            $o->items = DB::table('OrderItem')->where('orderId', $o->id)->get();
            return $o;
        });
});

Route::get('/orders/{number}', function (Request $r, string $number) use ($user) {
    $o = DB::table('Order')->where('number', $number)->first();
    if (!$o) return response()->json(['error' => 'Not found'], 404);
    $owner = $user($r) && ($user($r)->id === $o->userId || $user($r)->role === 'admin');
    if (!$owner && $o->email !== $r->query('email')) {
        return response()->json(['error' => 'Provide the order email to view this order'], 403);
    }
    $o->items = DB::table('OrderItem')->where('orderId', $o->id)->get();
    return $o;
});

/* ---------- Contact & newsletter ---------- */

Route::post('/contact', function (Request $r) use ($sendMail) {
    $data = $r->validate([
        'name' => 'required|string|min:2',
        'email' => 'required|email',
        'subject' => 'nullable|string',
        'message' => 'required|string|min:10',
    ]);
    DB::table('ContactMessage')->insert([
        'id' => 'c' . uniqid() . bin2hex(random_bytes(8)),
        'name' => $data['name'],
        'email' => $data['email'],
        'subject' => $data['subject'] ?? null,
        'message' => $data['message'],
        'read' => false,
        'createdAt' => now()->toDateTimeString(),
    ]);
    $sendMail('novettewatches@gmail.com', 'Contact: ' . ($data['subject'] ?? 'General enquiry'),
        "<p>From {$data['name']} &lt;{$data['email']}&gt;</p><p>" . e($data['message']) . '</p>');
    return response()->json(['ok' => true], 201);
});

Route::post('/newsletter', function (Request $r) {
    $r->validate(['email' => 'required|email']);
    DB::table('NewsletterSubscriber')->upsert(
        ['id' => 'c' . uniqid() . bin2hex(random_bytes(8)), 'email' => $r->email, 'createdAt' => now()->toDateTimeString()],
        ['email'], []
    );
    return response()->json(['ok' => true], 201);
});

/* ---------- Chat ---------- */

Route::get('/chat/thread', function (Request $r) use ($user, $requireAuth) {
    $requireAuth($r);
    $msgs = DB::table('ChatMessage')->where('userId', $user($r)->id)->orderBy('createdAt')->limit(200)->get();
    DB::table('ChatMessage')->where('userId', $user($r)->id)
        ->where('from', 'concierge')->where('readByUser', false)->update(['readByUser' => true]);
    if ($r->query('meta')) {
        $c = DB::table('ChatConversation')->where('userId', $user($r)->id)->first();
        return [
            'messages' => $msgs,
            'agentTyping' => $c && $c->adminTypingAt && strtotime($c->adminTypingAt) > time() - 6,
            'status' => $c->status ?? 'open',
        ];
    }
    return $msgs;
});

Route::post('/chat/messages', function (Request $r) use ($user, $requireAuth) {
    $requireAuth($r);
    $r->validate(['body' => 'required|string|max:2000']);
    $id = 'c' . uniqid() . bin2hex(random_bytes(8));
    DB::table('ChatMessage')->insert([
        'id' => $id, 'userId' => $user($r)->id, 'from' => 'customer',
        'body' => $r->input('body'), 'readByAdmin' => false, 'readByUser' => true,
        'createdAt' => now()->toDateTimeString(),
    ]);
    $u = $user($r);
    DB::table('ChatConversation')->upsert(
        ['userId' => $u->id, 'status' => 'open', 'customerTypingAt' => null, 'updatedAt' => now()->toDateTimeString()],
        ['userId'], ['status', 'customerTypingAt', 'updatedAt']
    );
    $recent = DB::table('Notification')->where('type', 'chat')->where('link', '/admin/chat/' . $u->id)
        ->where('read', 0)->where('createdAt', '>', now()->subMinutes(10))->exists();
    if (!$recent) Admin::notify('chat', "New chat message from {$u->name}", mb_strimwidth($r->input('body'), 0, 120, '…'), '/admin/chat/' . $u->id);
    return response()->json(DB::table('ChatMessage')->where('id', $id)->first(), 201);
});

Route::post('/chat/typing', function (Request $r) use ($user, $requireAuth) {
    $requireAuth($r);
    DB::table('ChatConversation')->upsert(
        ['userId' => $user($r)->id, 'status' => 'open', 'customerTypingAt' => now()->toDateTimeString(), 'updatedAt' => now()->toDateTimeString()],
        ['userId'], ['customerTypingAt']
    );
    return ['ok' => true];
});

/* ---------- Reviews ---------- */

Route::get('/watches/{slug}/reviews', function (string $slug) {
    $w = DB::table('Watch')->where('slug', $slug)->first();
    if (!$w) return response()->json(['error' => 'Not found'], 404);
    $q = DB::table('Review')->where('watchId', $w->id)->where('status', 'approved');
    return ['average' => round((float) $q->avg('rating'), 1), 'count' => $q->count(),
        'reviews' => $q->orderByDesc('createdAt')->limit(50)->get(['id', 'author', 'rating', 'title', 'body', 'createdAt'])];
});

Route::post('/reviews', function (Request $r) use ($user, $requireAuth) {
    $requireAuth($r);
    $d = $r->validate([
        'watchId' => 'required|string|exists:Watch,id',
        'rating' => 'required|numeric|min:1|max:5',
        'title' => 'nullable|string|max:120',
        'body' => 'required|string|min:10|max:2000',
    ]);
    $d['rating'] = round($d['rating'] * 2) / 2;
    $u = $user($r);
    $id = Admin::id();
    DB::table('Review')->insert($d + ['id' => $id, 'userId' => $u->id, 'author' => $u->name, 'status' => 'pending', 'createdAt' => now()->toDateTimeString()]);
    $w = DB::table('Watch')->where('id', $d['watchId'])->first();
    Admin::notify('review', "New {$d['rating']}★ review on {$w->model}", "By {$u->name}", '/admin/reviews');
    return response()->json(['ok' => true, 'message' => 'Thanks — your review will appear once approved.'], 201);
});

/* ---------- Uploaded media ---------- */

Route::get('/uploads/{file}', function (string $file) {
    $p = public_path('uploads/' . basename($file));
    return file_exists($p) ? response()->file($p) : abort(404);
});

/* ---------- Health ---------- */

Route::get('/health', fn () => ['ok' => true]);
