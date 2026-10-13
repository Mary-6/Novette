<?php

use App\Http\Middleware\SessionAuth;
use App\Support\Admin;
use App\Support\Catalog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

/*
|--------------------------------------------------------------------------
| Admin API — mounted at /api/admin. Every route except login is guarded by
| Admin::guard($request, <section>) which enforces staff role + permission.
|--------------------------------------------------------------------------
*/

$now = fn () => now()->toDateTimeString();

$staffPayload = function ($u) {
    return [
        'id' => $u->id, 'name' => $u->name, 'email' => $u->email, 'role' => $u->role,
        'roleLabel' => Admin::ROLES[$u->role] ?? $u->role, 'avatar' => $u->avatar,
        'sections' => Admin::sections($u),
    ];
};

$paginate = function ($q, Request $r, int $per = 15) {
    $page = max(1, (int) $r->query('page', 1));
    $per = min(100, max(5, (int) $r->query('per', $per)));
    $total = (clone $q)->count();
    return [
        'data' => $q->forPage($page, $per)->get(),
        'total' => $total, 'page' => $page, 'per' => $per, 'pages' => max(1, (int) ceil($total / $per)),
    ];
};

$sendMail = function (string $to, string $subject, string $html) {
    try {
        Mail::send([], [], fn ($m) => $m->to($to)->subject($subject)->html($html));
    } catch (\Throwable $e) {
        \Log::warning("[mail] to={$to} failed: {$e->getMessage()}");
    }
};

$range = function (Request $r) {
    $to = now()->endOfDay();
    $from = match ($r->query('range', 'month')) {
        'today' => now()->startOfDay(),
        'week' => now()->startOfWeek(),
        'year' => now()->startOfYear(),
        'custom' => \Carbon\Carbon::parse($r->query('from', now()->subMonth()->toDateString()))->startOfDay(),
        'all' => \Carbon\Carbon::create(2000),
        default => now()->startOfMonth(),
    };
    if ($r->query('range') === 'custom' && $r->query('to')) $to = \Carbon\Carbon::parse($r->query('to'))->endOfDay();
    return [$from, $to];
};

/* ===================== Auth ===================== */

Route::post('/auth/login', function (Request $r) use ($staffPayload, $now) {
    $d = $r->validate([
        'email' => 'required|email',
        'password' => 'required|string',
        'remember' => 'boolean',
    ], ['email.required' => 'Email is required', 'email.email' => 'Enter a valid email address', 'password.required' => 'Password is required']);
    $u = DB::table('User')->where('email', strtolower(trim($d['email'])))->first()
        ?? DB::table('User')->where('email', $d['email'])->first();
    if (!$u || !Hash::check($d['password'], (string) $u->passwordHash)) {
        return response()->json(['error' => 'Invalid email or password'], 401);
    }
    if (!array_key_exists($u->role, Admin::ROLES)) {
        return response()->json(['error' => 'This account does not have admin access'], 403);
    }
    if (!($u->isActive ?? 1)) {
        return response()->json(['error' => 'This admin account has been deactivated'], 403);
    }
    $remember = $d['remember'] ?? false;
    $days = $remember ? 30 : 1;
    $token = SessionAuth::jwtSign(['sub' => $u->id, 'jti' => bin2hex(random_bytes(16))], $days * 86400);
    DB::table('Session')->insert([
        'id' => Admin::id(), 'token' => $token, 'userId' => $u->id, 'remember' => $remember,
        'expiresAt' => now()->addDays($days)->toDateTimeString(), 'createdAt' => $now(),
    ]);
    DB::table('User')->where('id', $u->id)->update(['lastActiveAt' => $now()]);
    return response()->json(['user' => $staffPayload($u), 'redirect' => '/admin/dashboard'])
        ->withCookie(cookie('aw_session', $token, $remember ? $days * 1440 : 0, '/', null, request()->isSecure(), true, false, 'lax'));
})->middleware('throttle:10,1');

Route::post('/auth/logout', function (Request $r) {
    $token = $r->cookie('aw_session');
    if ($token) DB::table('Session')->where('token', $token)->delete();
    return response()->json(['ok' => true, 'redirect' => '/admin/login'])->withCookie(cookie()->forget('aw_session'));
});

Route::get('/me', function (Request $r) use ($staffPayload) {
    $u = Admin::guard($r, 'dashboard');
    return $staffPayload($u);
});

/* ===================== Badges & notifications ===================== */

$visibleNotifications = function ($u) {
    $prefs = json_decode($u->notifyPrefs ?: '{}', true) ?: [];
    $types = [];
    foreach (Admin::NOTIFY_SECTION as $type => $section) {
        $prefKey = in_array($type, ['low_stock', 'out_of_stock']) ? 'stock' : $type;
        if (Admin::can($u, $section) && ($prefs[$prefKey] ?? true)) $types[] = $type;
    }
    return DB::table('Notification')->whereIn('type', $types ?: ['__none__']);
};

Route::get('/badges', function (Request $r) use ($visibleNotifications) {
    $u = Admin::guard($r, 'dashboard');
    return [
        'notifications' => (clone $visibleNotifications($u))->where('read', 0)->count(),
        'chats' => Admin::can($u, 'chat') ? DB::table('ChatMessage')->where('from', 'customer')->where('readByAdmin', 0)->count() : 0,
        'pendingOrders' => Admin::can($u, 'orders') ? DB::table('Order')->where('status', 'pending')->count() : 0,
        'latest' => (clone $visibleNotifications($u))->orderByDesc('createdAt')->first(),
    ];
});

Route::get('/notifications', function (Request $r) use ($visibleNotifications, $paginate) {
    $u = Admin::guard($r, 'notifications');
    $q = $visibleNotifications($u)->orderByDesc('createdAt');
    if ($r->query('unread')) $q->where('read', 0);
    return $paginate($q, $r, 20);
});

Route::post('/notifications/{id}/read', function (Request $r, string $id) use ($visibleNotifications) {
    $u = Admin::guard($r, 'notifications');
    $visibleNotifications($u)->where('id', $id)->update(['read' => 1]);
    return ['ok' => true];
});

Route::post('/notifications/read-all', function (Request $r) use ($visibleNotifications) {
    $u = Admin::guard($r, 'notifications');
    $visibleNotifications($u)->update(['read' => 1]);
    return ['ok' => true];
});

/* ===================== Dashboard ===================== */

Route::get('/dashboard', function (Request $r) {
    $u = Admin::guard($r, 'dashboard');
    $out = ['cards' => [], 'recentOrders' => null, 'recentChats' => null, 'inventoryAlerts' => null];
    $c = &$out['cards'];
    if (Admin::can($u, 'products')) {
        $c['totalWatches'] = DB::table('Watch')->count();
        $c['lowStock'] = DB::table('Watch')->where('inventory', '>', 0)->whereColumn('inventory', '<=', 'lowStockAt')->count();
        $c['outOfStock'] = DB::table('Watch')->where('inventory', '<=', 0)->count();
    }
    if (Admin::can($u, 'customers')) $c['totalCustomers'] = DB::table('User')->where('role', 'customer')->count();
    if (Admin::can($u, 'orders')) {
        $c['newOrders'] = DB::table('Order')->where('createdAt', '>=', now()->subDays(7))->count();
        $c['pendingOrders'] = DB::table('Order')->where('status', 'pending')->count();
        $c['deliveredOrders'] = DB::table('Order')->where('status', 'delivered')->count();
        $out['recentOrders'] = DB::table('Order')->orderByDesc('createdAt')->limit(8)->get()->map(function ($o) {
            $items = DB::table('OrderItem')->where('orderId', $o->id)->get();
            return [
                'id' => $o->id, 'number' => $o->number, 'customer' => $o->customerName,
                'product' => $items->pluck('model')->join(', '), 'qty' => $items->sum('qty'),
                'total' => $o->total, 'createdAt' => $o->createdAt, 'status' => $o->status,
            ];
        });
    }
    if (Admin::can($u, 'chat')) {
        $c['unreadChats'] = DB::table('ChatMessage')->where('from', 'customer')->where('readByAdmin', 0)->distinct()->count('userId');
        $out['recentChats'] = DB::table('ChatMessage as m')
            ->join('User as u', 'u.id', '=', 'm.userId')
            ->select('m.userId', DB::raw('MAX(m.createdAt) as lastAt'))
            ->groupBy('m.userId')->orderByDesc('lastAt')->limit(6)->get()
            ->map(function ($row) {
                $usr = DB::table('User')->where('id', $row->userId)->first();
                $last = DB::table('ChatMessage')->where('userId', $row->userId)->orderByDesc('createdAt')->first();
                return [
                    'userId' => $row->userId, 'name' => $usr->name, 'avatar' => $usr->avatar,
                    'lastMessage' => $last->body, 'lastAt' => $last->createdAt, 'online' => Admin::online($usr),
                    'unread' => DB::table('ChatMessage')->where('userId', $row->userId)->where('from', 'customer')->where('readByAdmin', 0)->count(),
                ];
            });
    }
    if (Admin::can($u, 'inventory')) {
        $out['inventoryAlerts'] = DB::table('Watch')->whereColumn('inventory', '<=', 'lowStockAt')
            ->orderBy('inventory')->limit(10)->get(['id', 'model', 'brandSlug', 'sku', 'inventory', 'lowStockAt', 'slug', 'images'])
            ->map(function ($w) {
                $w->status = Admin::stockStatus($w);
                $w->image = Catalog::decorate((object) ['slug' => $w->slug, 'images' => $w->images, 'specs' => null, 'inventory' => $w->inventory])->image;
                return $w;
            });
    }
    return $out;
});

/* ===================== Uploads ===================== */

Route::post('/upload', function (Request $r) {
    Admin::guard($r, 'dashboard');
    $files = $r->file('images') ?: ($r->file('image') ? [$r->file('image')] : []);
    if (!$files) return response()->json(['error' => 'Choose at least one image'], 422);
    $urls = [];
    foreach ($files as $f) {
        if (!in_array($f->getMimeType(), ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])) {
            return response()->json(['error' => 'Images must be JPEG, PNG, WebP or SVG'], 422);
        }
        if ($f->getSize() > 8 * 1024 * 1024) return response()->json(['error' => 'Each image must be under 8 MB'], 422);
        $name = time() . '-' . Str::random(6) . '.' . ($f->guessExtension() ?: 'jpg');
        $f->move(public_path('uploads'), $name);
        $urls[] = '/uploads/' . $name;
    }
    return response()->json(['urls' => $urls, 'url' => $urls[0]], 201);
});

/* ===================== Products ===================== */

$productRules = function (?string $id = null) {
    return [
        'model' => 'required|string|max:255',
        'brandSlug' => 'required|string|exists:Brand,slug',
        'categorySlug' => 'nullable|string|exists:Category,slug',
        'description' => 'required|string|min:10',
        'price' => 'required|integer|min:1',
        'salePrice' => 'nullable|integer|min:1|lt:price',
        'inventory' => 'required|integer|min:0',
        'lowStockAt' => 'nullable|integer|min:0',
        'sku' => 'required|string|max:64|unique:Watch,sku' . ($id ? ",{$id},id" : ''),
        'reference' => 'nullable|string|max:255',
        'nickname' => 'nullable|string|max:255',
        'year' => 'nullable|integer|min:1900|max:2100',
        'type' => 'nullable|string|max:255',
        'material' => 'nullable|string|max:255',
        'condition' => 'nullable|string|max:255',
        'gender' => 'nullable|in:Men,Women,Unisex',
        'images' => 'nullable|array|max:12',
        'images.*' => 'string|max:255',
        'specs' => 'nullable|array',
        'isFeatured' => 'boolean', 'isNew' => 'boolean', 'isBestSeller' => 'boolean',
        'active' => 'boolean', 'boxPapers' => 'boolean',
    ];
};

$productOut = function ($w) {
    $w = Catalog::decorate($w);
    $w->stockStatus = Admin::stockStatus($w);
    $w->brandName = Catalog::brandName($w->brandSlug);
    $cat = $w->categorySlug ? DB::table('Category')->where('slug', $w->categorySlug)->value('name') : null;
    $w->categoryName = $cat;
    return $w;
};

Route::get('/products', function (Request $r) use ($paginate, $productOut) {
    Admin::guard($r, 'products');
    $q = DB::table('Watch');
    if ($r->q) {
        $t = '%' . $r->q . '%';
        $q->where(fn ($w) => $w->where('model', 'like', $t)->orWhere('sku', 'like', $t)->orWhere('reference', 'like', $t)->orWhere('nickname', 'like', $t));
    }
    if ($r->brand) $q->where('brandSlug', $r->brand);
    if ($r->category) $q->where('categorySlug', $r->category);
    if ($r->status === 'active') $q->where('active', 1);
    if ($r->status === 'inactive') $q->where('active', 0);
    if ($r->stock === 'out') $q->where('inventory', '<=', 0);
    if ($r->stock === 'low') $q->where('inventory', '>', 0)->whereColumn('inventory', '<=', 'lowStockAt');
    if ($r->flag && in_array($r->flag, ['isFeatured', 'isNew', 'isBestSeller'])) $q->where($r->flag, 1);
    [$col, $dir] = match ($r->sort) {
        'name' => ['model', 'asc'], 'price-asc' => ['price', 'asc'], 'price-desc' => ['price', 'desc'],
        'stock' => ['inventory', 'asc'], 'oldest' => ['addedAt', 'asc'], default => ['addedAt', 'desc'],
    };
    $q->orderBy($col, $dir);
    $res = $paginate($q, $r, 12);
    $res['data'] = $res['data']->map($productOut);
    return $res;
});

Route::get('/products/{id}', function (Request $r, string $id) use ($productOut) {
    Admin::guard($r, 'products');
    $w = DB::table('Watch')->where('id', $id)->first();
    if (!$w) return response()->json(['error' => 'Watch not found'], 404);
    $w = $productOut($w);
    $w->orders = DB::table('OrderItem')->where('watchId', $id)->sum('qty');
    $w->rating = round((float) DB::table('Review')->where('watchId', $id)->where('status', 'approved')->avg('rating'), 1);
    return $w;
});

$saveProduct = function (array $d, ?string $id) use ($now) {
    $row = $d;
    foreach (['isFeatured', 'isNew', 'isBestSeller', 'active', 'boxPapers'] as $b) {
        if (array_key_exists($b, $row)) $row[$b] = $row[$b] ? 1 : 0;
    }
    if (array_key_exists('images', $row)) $row['images'] = $row['images'] ? json_encode(array_values($row['images'])) : null;
    if (array_key_exists('specs', $row)) $row['specs'] = json_encode($row['specs'] ?: new \stdClass());
    $row['updatedAt'] = $now();
    if ($id) {
        DB::table('Watch')->where('id', $id)->update($row);
        return $id;
    }
    $base = Str::slug(($d['brandSlug'] ?? '') . ' ' . $d['model'] . ' ' . ($d['reference'] ?? $d['sku']));
    $slug = $base; $i = 2;
    while (DB::table('Watch')->where('slug', $slug)->exists()) $slug = $base . '-' . $i++;
    $newId = 'w-' . Str::lower(Str::random(10));
    DB::table('Watch')->insert($row + [
        'id' => $newId, 'slug' => $slug, 'reference' => $d['reference'] ?? $d['sku'],
        'year' => $d['year'] ?? (int) date('Y'), 'condition' => $d['condition'] ?? 'New',
        'popularity' => 50, 'addedAt' => $now(), 'lowStockAt' => $d['lowStockAt'] ?? 2,
    ]);
    return $newId;
};

Route::post('/products', function (Request $r) use ($productRules, $saveProduct, $productOut) {
    Admin::guard($r, 'products');
    $d = $r->validate($productRules());
    $id = $saveProduct($d, null);
    Admin::checkStock($id);
    return response()->json($productOut(DB::table('Watch')->where('id', $id)->first()), 201);
});

Route::match(['put', 'patch'], '/products/{id}', function (Request $r, string $id) use ($productRules, $saveProduct, $productOut) {
    Admin::guard($r, 'products');
    if (!DB::table('Watch')->where('id', $id)->exists()) return response()->json(['error' => 'Watch not found'], 404);
    $rules = $productRules($id);
    if ($r->isMethod('patch')) {
        $rules = array_intersect_key($rules, $r->all() + array_flip(array_filter(array_keys($rules), fn ($k) => str_contains($k, '.*') && $r->has(strtok($k, '.')))));
        $rules = array_map(fn ($rule) => str_replace('required|', 'sometimes|', $rule), $rules);
        if (isset($rules['salePrice']) && !$r->has('price')) $rules['salePrice'] = 'nullable|integer|min:1|lt:' . (int) DB::table('Watch')->where('id', $id)->value('price');
    }
    $d = $r->validate($rules);
    $saveProduct($d, $id);
    if (array_key_exists('inventory', $d)) Admin::checkStock($id);
    return $productOut(DB::table('Watch')->where('id', $id)->first());
});

Route::delete('/products/{id}', function (Request $r, string $id) {
    Admin::guard($r, 'products');
    DB::transaction(function () use ($id) {
        DB::table('CartItem')->where('watchId', $id)->delete();
        DB::table('WishlistItem')->where('watchId', $id)->delete();
        DB::table('Review')->where('watchId', $id)->delete();
        DB::table('Watch')->where('id', $id)->delete();
    });
    return ['ok' => true];
});

/* ===================== Categories ===================== */

Route::get('/categories', function (Request $r) {
    $u = Admin::guard($r, 'dashboard');
    if (!Admin::can($u, 'categories') && !Admin::can($u, 'analytics')) abort(response()->json(['error' => 'You do not have permission for this section'], 403));
    return DB::table('Category')->orderBy('sortOrder')->orderBy('name')->get()->map(function ($c) {
        $c->products = DB::table('Watch')->where('categorySlug', $c->slug)->count();
        return $c;
    });
});

Route::post('/categories', function (Request $r) use ($now) {
    Admin::guard($r, 'categories');
    $d = $r->validate(['name' => 'required|string|max:120|unique:Category,name', 'description' => 'nullable|string|max:500']);
    $slug = Str::slug($d['name']);
    if (DB::table('Category')->where('slug', $slug)->exists()) return response()->json(['error' => 'A category with that slug exists'], 422);
    $id = Admin::id();
    DB::table('Category')->insert($d + ['id' => $id, 'slug' => $slug, 'sortOrder' => (int) DB::table('Category')->max('sortOrder') + 1, 'createdAt' => $now(), 'updatedAt' => $now()]);
    return response()->json(DB::table('Category')->where('id', $id)->first(), 201);
});

Route::patch('/categories/{id}', function (Request $r, string $id) use ($now) {
    Admin::guard($r, 'categories');
    $d = $r->validate(['name' => "required|string|max:120|unique:Category,name,{$id},id", 'description' => 'nullable|string|max:500']);
    DB::table('Category')->where('id', $id)->update($d + ['updatedAt' => $now()]);
    return DB::table('Category')->where('id', $id)->first();
});

Route::delete('/categories/{id}', function (Request $r, string $id) {
    Admin::guard($r, 'categories');
    $c = DB::table('Category')->where('id', $id)->first();
    if (!$c) return response()->json(['error' => 'Not found'], 404);
    DB::table('Watch')->where('categorySlug', $c->slug)->update(['categorySlug' => null]);
    DB::table('Category')->where('id', $id)->delete();
    return ['ok' => true];
});

/* ===================== Brands ===================== */

Route::get('/brands', function (Request $r) {
    $u = Admin::guard($r, 'dashboard');
    if (!Admin::can($u, 'brands') && !Admin::can($u, 'products')) abort(response()->json(['error' => 'You do not have permission for this section'], 403));
    return DB::table('Brand')->orderBy('name')->get()->map(function ($b) {
        $b->watches = DB::table('Watch')->where('brandSlug', $b->slug)->count();
        return $b;
    });
});

Route::get('/brands/{id}', function (Request $r, string $id) use ($productOut) {
    Admin::guard($r, 'brands');
    $b = DB::table('Brand')->where('id', $id)->first();
    if (!$b) return response()->json(['error' => 'Not found'], 404);
    $b->items = DB::table('Watch')->where('brandSlug', $b->slug)->orderBy('model')->get()->map($productOut);
    return $b;
});

$brandRules = fn (?string $id = null) => [
    'name' => 'required|string|max:120|unique:Brand,name' . ($id ? ",{$id},id" : ''),
    'country' => 'nullable|string|max:120', 'founded' => 'nullable|string|max:16',
    'tagline' => 'nullable|string|max:255', 'intro' => 'nullable|string|max:3000', 'logo' => 'nullable|string|max:255',
];

Route::post('/brands', function (Request $r) use ($brandRules, $now) {
    Admin::guard($r, 'brands');
    $d = $r->validate($brandRules());
    $slug = Str::slug($d['name']);
    if (DB::table('Brand')->where('slug', $slug)->exists()) return response()->json(['error' => 'A brand with that name exists'], 422);
    $id = Admin::id();
    DB::table('Brand')->insert($d + ['id' => $id, 'slug' => $slug, 'createdAt' => $now(), 'updatedAt' => $now()]);
    return response()->json(DB::table('Brand')->where('id', $id)->first(), 201);
});

Route::patch('/brands/{id}', function (Request $r, string $id) use ($brandRules, $now) {
    Admin::guard($r, 'brands');
    $d = $r->validate($brandRules($id));
    DB::table('Brand')->where('id', $id)->update($d + ['updatedAt' => $now()]);
    return DB::table('Brand')->where('id', $id)->first();
});

Route::delete('/brands/{id}', function (Request $r, string $id) {
    Admin::guard($r, 'brands');
    $b = DB::table('Brand')->where('id', $id)->first();
    if (!$b) return response()->json(['error' => 'Not found'], 404);
    $n = DB::table('Watch')->where('brandSlug', $b->slug)->count();
    if ($n) return response()->json(['error' => "This brand still has {$n} watch(es). Reassign or delete them first."], 409);
    DB::table('Brand')->where('id', $id)->delete();
    return ['ok' => true];
});

/* ===================== Orders ===================== */

defined('ORDER_STATUSES') || define('ORDER_STATUSES', ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']);

$orderItems = function (string $orderId) {
    return DB::table('OrderItem')->where('orderId', $orderId)->get()->map(function ($i) {
        $w = DB::table('Watch')->where('id', $i->watchId)->first();
        $i->image = $w ? Catalog::decorate($w)->image : null;
        $i->slug = $w->slug ?? null;
        return $i;
    });
};

Route::get('/orders', function (Request $r) use ($paginate, $orderItems) {
    Admin::guard($r, 'orders');
    $q = DB::table('Order');
    if ($r->q) {
        $t = '%' . $r->q . '%';
        $q->where(fn ($w) => $w->where('number', 'like', $t)->orWhere('customerName', 'like', $t)->orWhere('email', 'like', $t)->orWhere('phone', 'like', $t));
    }
    if ($r->status && in_array($r->status, ORDER_STATUSES)) $q->where('status', $r->status);
    if ($r->from) $q->where('createdAt', '>=', $r->from);
    if ($r->to) $q->where('createdAt', '<=', $r->to . ' 23:59:59');
    $q->orderBy($r->sort === 'oldest' ? 'createdAt' : ($r->sort === 'total' ? 'total' : 'createdAt'), $r->sort === 'oldest' ? 'asc' : 'desc');
    $res = $paginate($q, $r, 15);
    $res['data'] = $res['data']->map(function ($o) use ($orderItems) {
        $o->items = $orderItems($o->id);
        $o->address = json_decode($o->address ?: '{}', true);
        return $o;
    });
    $res['counts'] = DB::table('Order')->select('status', DB::raw('count(*) as n'))->groupBy('status')->pluck('n', 'status');
    return $res;
});

Route::get('/orders/{id}', function (Request $r, string $id) use ($orderItems) {
    Admin::guard($r, 'orders');
    $o = DB::table('Order')->where('id', $id)->orWhere('number', $id)->first();
    if (!$o) return response()->json(['error' => 'Order not found'], 404);
    $o->items = $orderItems($o->id);
    $o->address = json_decode($o->address ?: '{}', true);
    $o->events = DB::table('OrderEvent')->where('orderId', $o->id)->orderBy('createdAt')->get();
    $o->customer = $o->userId ? DB::table('User')->where('id', $o->userId)->first(['id', 'name', 'email', 'phone', 'avatar', 'createdAt']) : null;
    return $o;
});

Route::patch('/orders/{id}', function (Request $r, string $id) use ($now, $sendMail) {
    $u = Admin::guard($r, 'orders');
    $d = $r->validate([
        'status' => 'nullable|in:' . implode(',', ORDER_STATUSES),
        'trackingNumber' => 'nullable|string|max:120',
        'note' => 'nullable|string|max:255',
    ]);
    $o = DB::table('Order')->where('id', $id)->first();
    if (!$o) return response()->json(['error' => 'Order not found'], 404);
    $upd = ['updatedAt' => $now()];
    if ($r->has('trackingNumber')) $upd['trackingNumber'] = $d['trackingNumber'];
    $newStatus = $d['status'] ?? null;
    DB::transaction(function () use ($o, $newStatus, &$upd, $d, $u, $now) {
        if ($newStatus && $newStatus !== $o->status) {
            if ($o->status === 'cancelled') abort(response()->json(['error' => 'Cancelled orders cannot be reopened'], 422));
            $upd['status'] = $newStatus;
            if ($newStatus === 'cancelled') {
                foreach (DB::table('OrderItem')->where('orderId', $o->id)->get() as $it) {
                    DB::table('Watch')->where('id', $it->watchId)->increment('inventory', $it->qty);
                }
            }
            DB::table('OrderEvent')->insert([
                'id' => Admin::id(), 'orderId' => $o->id, 'status' => $newStatus,
                'note' => trim(($d['note'] ?? '') . ' · by ' . $u->name, ' ·'), 'createdAt' => $now(),
            ]);
        } elseif (!empty($d['note'])) {
            DB::table('OrderEvent')->insert(['id' => Admin::id(), 'orderId' => $o->id, 'status' => $o->status, 'note' => $d['note'] . ' · by ' . $u->name, 'createdAt' => $now()]);
        }
        DB::table('Order')->where('id', $o->id)->update($upd);
    });
    $fresh = DB::table('Order')->where('id', $id)->first();
    if ($newStatus && $newStatus !== $o->status) {
        $label = ucfirst($newStatus);
        $extra = $newStatus === 'shipped' && $fresh->trackingNumber ? "<p>Tracking number: <b>{$fresh->trackingNumber}</b></p>" : '';
        $sendMail($fresh->email, "Order {$fresh->number} is now {$label} — Novette Watches",
            "<p>Hello {$fresh->customerName},</p><p>Your order <b>{$fresh->number}</b> status is now <b>{$label}</b>.</p>{$extra}<p>Questions? Reply to this email or open Live Chat on novettewatches.com.</p>");
    }
    return $fresh;
});

Route::post('/orders/{id}/contact', function (Request $r, string $id) use ($sendMail) {
    Admin::guard($r, 'orders');
    $d = $r->validate(['subject' => 'required|string|max:200', 'message' => 'required|string|min:5|max:5000']);
    $o = DB::table('Order')->where('id', $id)->first();
    if (!$o) return response()->json(['error' => 'Order not found'], 404);
    $sendMail($o->email, $d['subject'], '<p>' . nl2br(e($d['message'])) . '</p>');
    DB::table('OrderEvent')->insert(['id' => Admin::id(), 'orderId' => $o->id, 'status' => $o->status, 'note' => 'Emailed customer: ' . $d['subject'], 'createdAt' => now()->toDateTimeString()]);
    return ['ok' => true];
});

/* ===================== Customers ===================== */

Route::get('/customers', function (Request $r) use ($paginate) {
    Admin::guard($r, 'customers');
    $q = DB::table('User')->where('role', 'customer');
    if ($r->q) {
        $t = '%' . $r->q . '%';
        $q->where(fn ($w) => $w->where('name', 'like', $t)->orWhere('email', 'like', $t)->orWhere('phone', 'like', $t));
    }
    if ($r->status === 'active') $q->where('isActive', 1);
    if ($r->status === 'inactive') $q->where('isActive', 0);
    $q->orderBy($r->sort === 'name' ? 'name' : 'createdAt', $r->sort === 'name' ? 'asc' : 'desc');
    $res = $paginate($q, $r, 15);
    $res['data'] = $res['data']->map(fn ($c) => [
        'id' => $c->id, 'name' => $c->name, 'email' => $c->email, 'phone' => $c->phone, 'avatar' => $c->avatar,
        'orders' => DB::table('Order')->where('userId', $c->id)->count(), 'createdAt' => $c->createdAt,
        'isActive' => (bool) ($c->isActive ?? 1), 'lastActiveAt' => $c->lastActiveAt, 'online' => Admin::online($c),
        'verified' => (bool) $c->emailVerifiedAt,
    ]);
    return $res;
});

Route::get('/customers/{id}', function (Request $r, string $id) use ($orderItems) {
    $u = Admin::guard($r, 'customers');
    $c = DB::table('User')->where('id', $id)->where('role', 'customer')->first();
    if (!$c) return response()->json(['error' => 'Customer not found'], 404);
    $orders = DB::table('Order')->where('userId', $id)->orderByDesc('createdAt')->get()->map(function ($o) use ($orderItems) {
        $o->items = $orderItems($o->id);
        return $o;
    });
    return [
        'id' => $c->id, 'name' => $c->name, 'email' => $c->email, 'phone' => $c->phone, 'avatar' => $c->avatar,
        'createdAt' => $c->createdAt, 'lastActiveAt' => $c->lastActiveAt, 'online' => Admin::online($c),
        'isActive' => (bool) ($c->isActive ?? 1), 'verified' => (bool) $c->emailVerifiedAt,
        'currentOrders' => $orders->filter(fn ($o) => !in_array($o->status, ['delivered', 'cancelled']))->values(),
        'previousOrders' => $orders->filter(fn ($o) => in_array($o->status, ['delivered', 'cancelled']))->values(),
        'chat' => DB::table('ChatMessage')->where('userId', $id)->orderBy('createdAt')->limit(300)->get(),
        'wishlist' => DB::table('WishlistItem')->where('userId', $id)->count(),
    ];
});

Route::patch('/customers/{id}', function (Request $r, string $id) {
    Admin::guard($r, 'customers');
    $d = $r->validate(['isActive' => 'required|boolean']);
    $n = DB::table('User')->where('id', $id)->where('role', 'customer')->update(['isActive' => $d['isActive'] ? 1 : 0]);
    if (!$n && !DB::table('User')->where('id', $id)->where('role', 'customer')->exists()) return response()->json(['error' => 'Customer not found'], 404);
    if (!$d['isActive']) DB::table('Session')->where('userId', $id)->delete();
    return ['ok' => true, 'isActive' => $d['isActive']];
});

Route::delete('/customers/{id}', function (Request $r, string $id) {
    Admin::guard($r, 'customers');
    $c = DB::table('User')->where('id', $id)->where('role', 'customer')->first();
    if (!$c) return response()->json(['error' => 'Customer not found'], 404);
    DB::transaction(function () use ($id) {
        foreach (['Session', 'AuthToken', 'CartItem', 'WishlistItem', 'ChatMessage', 'ChatConversation'] as $t) DB::table($t)->where('userId', $id)->delete();
        DB::table('Order')->where('userId', $id)->update(['userId' => null]);
        DB::table('Review')->where('userId', $id)->update(['userId' => null]);
        DB::table('User')->where('id', $id)->delete();
    });
    return ['ok' => true];
});

Route::get('/inbox', function (Request $r) use ($paginate) {
    Admin::guard($r, 'customers');
    return $paginate(DB::table('ContactMessage')->orderByDesc('createdAt'), $r, 20);
});
Route::patch('/inbox/{id}', function (Request $r, string $id) {
    Admin::guard($r, 'customers');
    DB::table('ContactMessage')->where('id', $id)->update(['read' => $r->boolean('read') ? 1 : 0]);
    return ['ok' => true];
});
Route::delete('/inbox/{id}', function (Request $r, string $id) {
    Admin::guard($r, 'customers');
    DB::table('ContactMessage')->where('id', $id)->delete();
    return ['ok' => true];
});
Route::get('/subscribers', function (Request $r) use ($paginate) {
    Admin::guard($r, 'customers');
    return $paginate(DB::table('NewsletterSubscriber')->orderByDesc('createdAt'), $r, 25);
});
Route::delete('/subscribers/{id}', function (Request $r, string $id) {
    Admin::guard($r, 'customers');
    DB::table('NewsletterSubscriber')->where('id', $id)->delete();
    return ['ok' => true];
});

/* ===================== Live chat ===================== */

$conversation = function (string $uid) {
    $c = DB::table('ChatConversation')->where('userId', $uid)->first();
    $u = DB::table('User')->where('id', $uid)->first();
    $last = DB::table('ChatMessage')->where('userId', $uid)->orderByDesc('createdAt')->first();
    return [
        'userId' => $uid, 'name' => $u->name ?? 'Deleted user', 'email' => $u->email ?? null, 'avatar' => $u->avatar ?? null,
        'online' => Admin::online($u), 'lastActiveAt' => $u->lastActiveAt ?? null,
        'typing' => $c && $c->customerTypingAt && strtotime($c->customerTypingAt) > time() - 6,
        'status' => $c->status ?? 'open',
        'lastMessage' => $last ? ['body' => $last->body, 'from' => $last->from, 'createdAt' => $last->createdAt] : null,
        'unread' => DB::table('ChatMessage')->where('userId', $uid)->where('from', 'customer')->where('readByAdmin', 0)->count(),
    ];
};

Route::get('/chats', function (Request $r) use ($conversation) {
    Admin::guard($r, 'chat');
    $q = DB::table('ChatMessage as m')->join('User as u', 'u.id', '=', 'm.userId')
        ->select('m.userId', DB::raw('MAX(m.createdAt) as lastAt'))->groupBy('m.userId')->orderByDesc('lastAt');
    if ($r->q) {
        $t = '%' . $r->q . '%';
        $q->where(fn ($w) => $w->where('u.name', 'like', $t)->orWhere('u.email', 'like', $t)->orWhere('m.body', 'like', $t));
    }
    $list = $q->limit(200)->get()->map(fn ($row) => $conversation($row->userId));
    if ($r->status && in_array($r->status, ['open', 'closed'])) $list = $list->where('status', $r->status)->values();
    if ($r->status === 'unread') $list = $list->filter(fn ($c) => $c['unread'] > 0)->values();
    return $list;
});

Route::get('/chats/{uid}', function (Request $r, string $uid) use ($conversation) {
    Admin::guard($r, 'chat');
    if (!DB::table('User')->where('id', $uid)->exists()) return response()->json(['error' => 'Conversation not found'], 404);
    $q = DB::table('ChatMessage')->where('userId', $uid)->orderBy('createdAt');
    $msgs = $q->limit(500)->get();
    DB::table('ChatMessage')->where('userId', $uid)->where('from', 'customer')->where('readByAdmin', 0)->update(['readByAdmin' => 1]);
    DB::table('Notification')->where('type', 'chat')->where('link', '/admin/chat/' . $uid)->update(['read' => 1]);
    return ['conversation' => $conversation($uid), 'messages' => $msgs];
});

Route::post('/chats/{uid}', function (Request $r, string $uid) use ($now) {
    $u = Admin::guard($r, 'chat');
    $d = $r->validate(['body' => 'nullable|string|max:2000', 'watchId' => 'nullable|string|exists:Watch,id']);
    if (empty($d['body']) && empty($d['watchId'])) return response()->json(['error' => 'Message cannot be empty'], 422);
    if (!DB::table('User')->where('id', $uid)->exists()) return response()->json(['error' => 'Conversation not found'], 404);
    $body = trim($d['body'] ?? '');
    if (!empty($d['watchId'])) {
        $w = Catalog::decorate(DB::table('Watch')->where('id', $d['watchId'])->first());
        $price = '$' . number_format($w->onSale ? $w->salePrice : $w->price);
        $card = "⌚ " . Catalog::brandName($w->brandSlug) . " {$w->model} (Ref. {$w->reference}) — {$price}\n" . rtrim(config('app.url'), '/') . "/watches/{$w->slug}";
        $body = $body ? $body . "\n\n" . $card : $card;
    }
    $id = Admin::id();
    DB::table('ChatMessage')->insert([
        'id' => $id, 'userId' => $uid, 'from' => 'concierge', 'body' => $body,
        'readByAdmin' => 1, 'readByUser' => 0, 'createdAt' => $now(),
    ]);
    DB::table('ChatConversation')->upsert(
        ['userId' => $uid, 'status' => 'open', 'adminTypingAt' => null, 'updatedAt' => $now()],
        ['userId'], ['status', 'adminTypingAt', 'updatedAt']
    );
    return response()->json(DB::table('ChatMessage')->where('id', $id)->first(), 201);
});

Route::post('/chats/{uid}/typing', function (Request $r, string $uid) use ($now) {
    Admin::guard($r, 'chat');
    DB::table('ChatConversation')->upsert(
        ['userId' => $uid, 'status' => 'open', 'adminTypingAt' => $now(), 'updatedAt' => $now()],
        ['userId'], ['adminTypingAt']
    );
    return ['ok' => true];
});

Route::patch('/chats/{uid}', function (Request $r, string $uid) use ($now) {
    Admin::guard($r, 'chat');
    $d = $r->validate(['status' => 'required|in:open,closed']);
    DB::table('ChatConversation')->upsert(
        ['userId' => $uid, 'status' => $d['status'], 'updatedAt' => $now()],
        ['userId'], ['status', 'updatedAt']
    );
    if ($d['status'] === 'closed') {
        DB::table('ChatMessage')->insert([
            'id' => Admin::id(), 'userId' => $uid, 'from' => 'concierge',
            'body' => 'This conversation has been closed. Send a new message any time to reopen it.',
            'readByAdmin' => 1, 'readByUser' => 0, 'createdAt' => $now(),
        ]);
    }
    return ['ok' => true];
});

Route::get('/chat-products', function (Request $r) {
    Admin::guard($r, 'chat');
    $t = '%' . $r->query('q', '') . '%';
    return DB::table('Watch')->where('active', 1)->where(fn ($w) => $w->where('model', 'like', $t)->orWhere('reference', 'like', $t)->orWhere('brandSlug', 'like', $t))
        ->orderByDesc('popularity')->limit(8)->get()->map(fn ($w) => Catalog::decorate($w));
});

/* ===================== Inventory ===================== */

Route::get('/inventory', function (Request $r) use ($paginate) {
    Admin::guard($r, 'inventory');
    $q = DB::table('Watch');
    if ($r->q) {
        $t = '%' . $r->q . '%';
        $q->where(fn ($w) => $w->where('model', 'like', $t)->orWhere('sku', 'like', $t));
    }
    if ($r->status === 'out') $q->where('inventory', '<=', 0);
    if ($r->status === 'low') $q->where('inventory', '>', 0)->whereColumn('inventory', '<=', 'lowStockAt');
    if ($r->status === 'in') $q->whereColumn('inventory', '>', 'lowStockAt');
    $q->orderBy($r->sort === 'name' ? 'model' : 'inventory');
    $res = $paginate($q, $r, 20);
    $res['data'] = $res['data']->map(function ($w) {
        $d = Catalog::decorate($w);
        return ['id' => $w->id, 'model' => $w->model, 'brand' => Catalog::brandName($w->brandSlug), 'sku' => $w->sku,
            'inventory' => (int) $w->inventory, 'lowStockAt' => (int) $w->lowStockAt, 'status' => Admin::stockStatus($w),
            'updatedAt' => $w->updatedAt ?? $w->addedAt, 'image' => $d->image];
    });
    $res['summary'] = [
        'in' => DB::table('Watch')->whereColumn('inventory', '>', 'lowStockAt')->count(),
        'low' => DB::table('Watch')->where('inventory', '>', 0)->whereColumn('inventory', '<=', 'lowStockAt')->count(),
        'out' => DB::table('Watch')->where('inventory', '<=', 0)->count(),
        'units' => (int) DB::table('Watch')->sum('inventory'),
    ];
    return $res;
});

Route::patch('/inventory/{id}', function (Request $r, string $id) use ($now) {
    Admin::guard($r, 'inventory');
    $d = $r->validate(['inventory' => 'required|integer|min:0|max:100000', 'lowStockAt' => 'nullable|integer|min:0|max:1000'],
        ['inventory.min' => 'Stock cannot be negative']);
    if (!DB::table('Watch')->where('id', $id)->exists()) return response()->json(['error' => 'Watch not found'], 404);
    DB::table('Watch')->where('id', $id)->update(array_filter($d, fn ($v) => $v !== null) + ['updatedAt' => $now()]);
    Admin::checkStock($id);
    $w = DB::table('Watch')->where('id', $id)->first();
    return ['id' => $id, 'inventory' => (int) $w->inventory, 'lowStockAt' => (int) $w->lowStockAt, 'status' => Admin::stockStatus($w), 'updatedAt' => $w->updatedAt];
});

/* ===================== Reviews ===================== */

Route::get('/reviews', function (Request $r) use ($paginate) {
    Admin::guard($r, 'reviews');
    $q = DB::table('Review as r')->leftJoin('Watch as w', 'w.id', '=', 'r.watchId')->leftJoin('User as u', 'u.id', '=', 'r.userId')
        ->select('r.*', 'w.model as watchModel', 'w.slug as watchSlug', 'u.email as userEmail');
    if ($r->status && in_array($r->status, ['pending', 'approved', 'rejected'])) $q->where('r.status', $r->status);
    if ($r->rating) $q->where('r.rating', '>=', (int) $r->rating)->where('r.rating', '<', (int) $r->rating + 1);
    if ($r->q) {
        $t = '%' . $r->q . '%';
        $q->where(fn ($w) => $w->where('r.body', 'like', $t)->orWhere('r.author', 'like', $t)->orWhere('w.model', 'like', $t));
    }
    $q->orderByDesc('r.createdAt');
    $res = $paginate($q, $r, 15);
    $res['averages'] = DB::table('Review as r')->join('Watch as w', 'w.id', '=', 'r.watchId')->where('r.status', 'approved')
        ->select('w.model', 'w.id', DB::raw('ROUND(AVG(r.rating),1) as avg'), DB::raw('COUNT(*) as n'))
        ->groupBy('w.id', 'w.model')->orderByDesc('n')->limit(10)->get();
    $res['overall'] = round((float) DB::table('Review')->where('status', 'approved')->avg('rating'), 2);
    $res['counts'] = DB::table('Review')->select('status', DB::raw('count(*) as n'))->groupBy('status')->pluck('n', 'status');
    return $res;
});

Route::patch('/reviews/{id}', function (Request $r, string $id) {
    Admin::guard($r, 'reviews');
    $d = $r->validate(['status' => 'required_without:rating|in:pending,approved,rejected', 'rating' => 'required_without:status|numeric|min:1|max:5']);
    if (isset($d['rating'])) $d['rating'] = round($d['rating'] * 2) / 2;
    abort_unless(DB::table('Review')->where('id', $id)->exists(), 404);
    DB::table('Review')->where('id', $id)->update($d);
    return ['ok' => true];
});

Route::delete('/reviews/{id}', function (Request $r, string $id) {
    Admin::guard($r, 'reviews');
    DB::table('Review')->where('id', $id)->delete();
    return ['ok' => true];
});

/* ===================== Promotions ===================== */

$promoRules = fn (?string $id = null) => [
    'name' => 'required|string|max:160',
    'kind' => 'required|in:promo_code,discount,product,seasonal',
    'code' => 'nullable|required_if:kind,promo_code|string|max:40|alpha_dash|unique:Promotion,code' . ($id ? ",{$id},id" : ''),
    'description' => 'nullable|string|max:1000',
    'type' => 'required|in:percent,fixed',
    'value' => 'required|integer|min:1' . (request()->input('type') === 'percent' ? '|max:100' : ''),
    'startDate' => 'nullable|date',
    'endDate' => 'nullable|date|after_or_equal:startDate',
    'appliesTo' => 'nullable|array',
    'appliesTo.*' => 'string|exists:Watch,id',
    'status' => 'required|in:active,inactive',
];

$promoOut = function ($p) {
    $p->appliesTo = json_decode($p->appliesTo ?: '[]', true) ?: [];
    $live = $p->status === 'active' && (!$p->startDate || strtotime($p->startDate) <= time()) && (!$p->endDate || strtotime($p->endDate) >= time());
    $p->state = $p->status !== 'active' ? 'inactive' : ($live ? 'live' : ($p->startDate && strtotime($p->startDate) > time() ? 'scheduled' : 'expired'));
    $p->uses = $p->code ? DB::table('Order')->where('promoCode', $p->code)->count() : null;
    return $p;
};

Route::get('/promotions', function (Request $r) use ($promoOut) {
    Admin::guard($r, 'promotions');
    $q = DB::table('Promotion')->orderByDesc('createdAt');
    if ($r->kind) $q->where('kind', $r->kind);
    return $q->get()->map($promoOut);
});

$savePromo = function (array $d, ?string $id) use ($now, $promoOut) {
    $row = $d;
    if (!empty($row['code'])) $row['code'] = strtoupper($row['code']);
    else $row['code'] = null;
    $row['appliesTo'] = json_encode(array_values($d['appliesTo'] ?? []));
    $row['updatedAt'] = $now();
    if ($id) DB::table('Promotion')->where('id', $id)->update($row);
    else DB::table('Promotion')->insert($row + ['id' => $id = Admin::id(), 'createdAt' => $now()]);
    return $promoOut(DB::table('Promotion')->where('id', $id)->first());
};

Route::post('/promotions', function (Request $r) use ($promoRules, $savePromo) {
    Admin::guard($r, 'promotions');
    return response()->json($savePromo($r->validate($promoRules()), null), 201);
});

Route::patch('/promotions/{id}', function (Request $r, string $id) use ($promoRules, $savePromo) {
    Admin::guard($r, 'promotions');
    if (!DB::table('Promotion')->where('id', $id)->exists()) return response()->json(['error' => 'Not found'], 404);
    return $savePromo($r->validate($promoRules($id)), $id);
});

Route::delete('/promotions/{id}', function (Request $r, string $id) {
    Admin::guard($r, 'promotions');
    DB::table('Promotion')->where('id', $id)->delete();
    return ['ok' => true];
});

/* ===================== Analytics ===================== */

Route::get('/analytics', function (Request $r) use ($range) {
    Admin::guard($r, 'analytics');
    [$from, $to] = $range($r);
    $orders = DB::table('Order')->whereBetween('createdAt', [$from, $to]);
    $validOrderIds = (clone $orders)->where('status', '!=', 'cancelled')->pluck('id');
    $days = $from->diffInDays($to);
    $fmt = $days > 120 ? '%Y-%m' : '%Y-%m-%d';
    $series = fn ($table, $extra = null) => DB::table($table)->whereBetween('createdAt', [$from, $to])
        ->when($extra, $extra)
        ->select(DB::raw("DATE_FORMAT(createdAt, '{$fmt}') as d"), DB::raw('COUNT(*) as n'))
        ->groupBy('d')->orderBy('d')->pluck('n', 'd');

    $topWatches = DB::table('OrderItem')->whereIn('orderId', $validOrderIds)
        ->select('watchId', 'model', DB::raw('SUM(qty) as units'), DB::raw('COUNT(DISTINCT orderId) as orders'))
        ->groupBy('watchId', 'model')->orderByDesc('units')->limit(10)->get();
    $topBrands = DB::table('OrderItem as i')->join('Watch as w', 'w.id', '=', 'i.watchId')->whereIn('i.orderId', $validOrderIds)
        ->select('w.brandSlug', DB::raw('SUM(i.qty) as units'))->groupBy('w.brandSlug')->orderByDesc('units')->limit(8)->get()
        ->map(fn ($b) => ['name' => Catalog::brandName($b->brandSlug), 'units' => (int) $b->units]);
    $topCategories = DB::table('OrderItem as i')->join('Watch as w', 'w.id', '=', 'i.watchId')
        ->leftJoin('Category as c', 'c.slug', '=', 'w.categorySlug')->whereIn('i.orderId', $validOrderIds)
        ->select(DB::raw("COALESCE(c.name, 'Uncategorised') as name"), DB::raw('SUM(i.qty) as units'))
        ->groupBy('name')->orderByDesc('units')->get();
    $performance = DB::table('Watch as w')
        ->select('w.id', 'w.model', 'w.inventory',
            DB::raw('(SELECT COALESCE(SUM(qty),0) FROM OrderItem oi WHERE oi.watchId = w.id) as units'),
            DB::raw('(SELECT COUNT(*) FROM WishlistItem wi WHERE wi.watchId = w.id) as wishlists'),
            DB::raw("(SELECT ROUND(AVG(rating),1) FROM Review rv WHERE rv.watchId = w.id AND rv.status = 'approved') as rating"))
        ->orderByDesc('units')->orderByDesc('wishlists')->limit(10)->get();

    return [
        'range' => ['from' => $from->toDateString(), 'to' => $to->toDateString()],
        'totals' => [
            'orders' => (clone $orders)->count(),
            'unitsOrdered' => (int) DB::table('OrderItem')->whereIn('orderId', $validOrderIds)->sum('qty'),
            'newCustomers' => DB::table('User')->where('role', 'customer')->whereBetween('createdAt', [$from, $to])->count(),
            'customers' => DB::table('User')->where('role', 'customer')->count(),
            'products' => DB::table('Watch')->count(),
            'activeProducts' => DB::table('Watch')->where('active', 1)->count(),
            'chatMessages' => DB::table('ChatMessage')->whereBetween('createdAt', [$from, $to])->count(),
            'conversations' => DB::table('ChatMessage')->whereBetween('createdAt', [$from, $to])->distinct()->count('userId'),
        ],
        'ordersSeries' => $series('Order'),
        'customerGrowth' => $series('User', fn ($q) => $q->where('role', 'customer')),
        'chatSeries' => $series('ChatMessage'),
        'statusStats' => (clone $orders)->select('status', DB::raw('count(*) as n'))->groupBy('status')->pluck('n', 'status'),
        'topWatches' => $topWatches,
        'topBrands' => $topBrands,
        'topCategories' => $topCategories,
        'productPerformance' => $performance,
        'inventory' => [
            'in' => DB::table('Watch')->whereColumn('inventory', '>', 'lowStockAt')->count(),
            'low' => DB::table('Watch')->where('inventory', '>', 0)->whereColumn('inventory', '<=', 'lowStockAt')->count(),
            'out' => DB::table('Watch')->where('inventory', '<=', 0)->count(),
            'units' => (int) DB::table('Watch')->sum('inventory'),
        ],
    ];
});

/* ===================== Website content ===================== */

$defaultContent = fn () => [
    'hero' => ['title' => 'Timeless Luxury.', 'highlight' => 'Iconic Timepieces.', 'subtitle' => 'Authenticated luxury watches, curated for collectors and delivered fully insured across the United States.',
        'ctaLabel' => 'Shop Watches', 'ctaLink' => '/shop', 'images' => []],
    'promo' => ['enabled' => false, 'eyebrow' => 'Seasonal Edit', 'title' => '', 'text' => '', 'ctaLabel' => 'Shop the Edit', 'ctaLink' => '/shop'],
    'about' => ['title' => 'About Novette Watches', 'body' => "For nearly four decades Novette Watches has brought together the world's most legendary watches for collectors who value precision, heritage and lasting value.\n\nEvery watch undergoes a multi-point inspection by our certified horologists. Serving clients across the United States, entirely online."],
    'contact' => ['phone' => '+1 800 555 0148', 'email' => 'novettewatches@gmail.com', 'address' => '', 'hours' => 'Mon–Sat, 10am–6pm ET'],
    'socials' => ['instagram' => '', 'facebook' => '', 'x' => '', 'youtube' => '', 'tiktok' => ''],
];

Route::get('/content', function (Request $r) use ($defaultContent) {
    Admin::guard($r, 'content');
    $c = array_replace_recursive($defaultContent(), Admin::setting('content', []));
    $flag = fn ($f) => DB::table('Watch')->where($f, 1)->orderBy('model')->get(['id', 'model', 'brandSlug', 'slug', 'images', 'specs', 'inventory'])
        ->map(fn ($w) => ['id' => $w->id, 'model' => $w->model, 'brand' => Catalog::brandName($w->brandSlug), 'image' => Catalog::decorate($w)->image]);
    $c['lists'] = ['isFeatured' => $flag('isFeatured'), 'isNew' => $flag('isNew'), 'isBestSeller' => $flag('isBestSeller')];
    $c['faqs'] = DB::table('Faq')->orderBy('sortOrder')->get();
    return $c;
});

Route::put('/content', function (Request $r) use ($defaultContent) {
    Admin::guard($r, 'content');
    $d = $r->validate([
        'hero.title' => 'required|string|max:120', 'hero.highlight' => 'nullable|string|max:120',
        'hero.subtitle' => 'nullable|string|max:400', 'hero.ctaLabel' => 'nullable|string|max:40', 'hero.ctaLink' => 'nullable|string|max:255',
        'hero.images' => 'nullable|array|max:8', 'hero.images.*' => 'string|max:255',
        'promo.enabled' => 'boolean', 'promo.eyebrow' => 'nullable|string|max:60', 'promo.title' => 'nullable|string|max:160',
        'promo.text' => 'nullable|string|max:600', 'promo.ctaLabel' => 'nullable|string|max:40', 'promo.ctaLink' => 'nullable|string|max:255',
        'about.title' => 'required|string|max:160', 'about.body' => 'required|string|max:10000',
        'contact.phone' => 'required|string|max:40', 'contact.email' => 'required|email', 'contact.address' => 'nullable|string|max:255', 'contact.hours' => 'nullable|string|max:120',
        'socials.*' => 'nullable|url|max:255',
    ], ['socials.*.url' => 'Social links must be full URLs (https://…)']);
    $c = array_replace_recursive($defaultContent(), $d);
    Admin::putSetting('content', $c);
    Admin::putSetting('supportPhone', $c['contact']['phone']);
    Admin::putSetting('contactEmail', $c['contact']['email']);
    Admin::putSetting('address', $c['contact']['address']);
    Admin::putSetting('socials', $c['socials']);
    return ['ok' => true];
});

Route::post('/faqs', function (Request $r) use ($now) {
    Admin::guard($r, 'content');
    $d = $r->validate(['category' => 'required|string|max:120', 'question' => 'required|string|max:500', 'answer' => 'required|string|max:5000']);
    $id = Admin::id();
    DB::table('Faq')->insert($d + ['id' => $id, 'sortOrder' => (int) DB::table('Faq')->max('sortOrder') + 1, 'createdAt' => $now(), 'updatedAt' => $now()]);
    return response()->json(DB::table('Faq')->where('id', $id)->first(), 201);
});
Route::patch('/faqs/{id}', function (Request $r, string $id) use ($now) {
    Admin::guard($r, 'content');
    $d = $r->validate(['category' => 'required|string|max:120', 'question' => 'required|string|max:500', 'answer' => 'required|string|max:5000']);
    DB::table('Faq')->where('id', $id)->update($d + ['updatedAt' => $now()]);
    return DB::table('Faq')->where('id', $id)->first();
});
Route::delete('/faqs/{id}', function (Request $r, string $id) {
    Admin::guard($r, 'content');
    DB::table('Faq')->where('id', $id)->delete();
    return ['ok' => true];
});
Route::post('/faqs/reorder', function (Request $r) {
    Admin::guard($r, 'content');
    $d = $r->validate(['ids' => 'required|array', 'ids.*' => 'string']);
    foreach ($d['ids'] as $i => $id) DB::table('Faq')->where('id', $id)->update(['sortOrder' => $i]);
    return ['ok' => true];
});

/* ===================== Admin users & roles ===================== */

Route::get('/users', function (Request $r) {
    Admin::guard($r, 'users');
    return [
        'roles' => collect(Admin::ROLES)->map(fn ($label, $key) => ['key' => $key, 'label' => $label,
            'sections' => $key === 'admin' ? Admin::SECTIONS : Admin::PERMISSIONS[$key]])->values(),
        'users' => DB::table('User')->whereIn('role', array_keys(Admin::ROLES))->orderBy('createdAt')->get()
            ->map(fn ($u) => ['id' => $u->id, 'name' => $u->name, 'email' => $u->email, 'role' => $u->role,
                'roleLabel' => Admin::ROLES[$u->role], 'isActive' => (bool) ($u->isActive ?? 1), 'avatar' => $u->avatar,
                'lastActiveAt' => $u->lastActiveAt, 'createdAt' => $u->createdAt, 'online' => Admin::online($u)]),
    ];
});

$superAdminsLeft = fn (string $excludeId) => DB::table('User')->where('role', 'admin')->where('isActive', 1)->where('id', '!=', $excludeId)->count();

Route::post('/users', function (Request $r) use ($now) {
    Admin::guard($r, 'users');
    $d = $r->validate([
        'name' => 'required|string|min:2|max:120', 'email' => 'required|email|max:255',
        'password' => 'required|string|min:8|max:200', 'role' => 'required|in:' . implode(',', array_keys(Admin::ROLES)),
    ]);
    $d['email'] = strtolower($d['email']);
    $existing = DB::table('User')->where('email', $d['email'])->first();
    if ($existing && array_key_exists($existing->role, Admin::ROLES)) return response()->json(['error' => 'That email is already an admin user'], 422);
    if ($existing) {
        DB::table('User')->where('id', $existing->id)->update(['name' => $d['name'], 'role' => $d['role'], 'passwordHash' => Hash::make($d['password']), 'isActive' => 1]);
        DB::table('Session')->where('userId', $existing->id)->delete();
        return response()->json(['id' => $existing->id], 201);
    }
    $id = Admin::id();
    DB::table('User')->insert(['id' => $id, 'name' => $d['name'], 'email' => $d['email'], 'passwordHash' => Hash::make($d['password']),
        'role' => $d['role'], 'isActive' => 1, 'emailVerifiedAt' => $now(), 'createdAt' => $now()]);
    return response()->json(['id' => $id], 201);
});

Route::patch('/users/{id}', function (Request $r, string $id) use ($superAdminsLeft) {
    $me = Admin::guard($r, 'users');
    $u = DB::table('User')->where('id', $id)->whereIn('role', array_keys(Admin::ROLES))->first();
    if (!$u) return response()->json(['error' => 'Admin user not found'], 404);
    $d = $r->validate([
        'name' => 'sometimes|string|min:2|max:120', 'email' => "sometimes|email|max:255|unique:User,email,{$id},id",
        'role' => 'sometimes|in:' . implode(',', array_keys(Admin::ROLES)), 'isActive' => 'sometimes|boolean',
        'password' => 'sometimes|string|min:8|max:200',
    ]);
    $demoting = (isset($d['role']) && $d['role'] !== 'admin') || (isset($d['isActive']) && !$d['isActive']);
    if ($u->role === 'admin' && $demoting && !$superAdminsLeft($id)) return response()->json(['error' => 'At least one active Super Admin is required'], 422);
    if ($id === $me->id && $demoting) return response()->json(['error' => 'You cannot demote or deactivate your own account'], 422);
    $upd = array_intersect_key($d, array_flip(['name', 'email', 'role']));
    if (isset($d['isActive'])) $upd['isActive'] = $d['isActive'] ? 1 : 0;
    if (isset($d['password'])) $upd['passwordHash'] = Hash::make($d['password']);
    if ($upd) DB::table('User')->where('id', $id)->update($upd);
    if (isset($d['password']) || $demoting || isset($d['role'])) {
        DB::table('Session')->where('userId', $id)->when($id === $me->id, fn ($q) => $q->where('token', '!=', $r->cookie('aw_session')))->delete();
    }
    return ['ok' => true];
});

Route::delete('/users/{id}', function (Request $r, string $id) use ($superAdminsLeft) {
    $me = Admin::guard($r, 'users');
    if ($id === $me->id) return response()->json(['error' => 'You cannot delete your own account'], 422);
    $u = DB::table('User')->where('id', $id)->whereIn('role', array_keys(Admin::ROLES))->first();
    if (!$u) return response()->json(['error' => 'Admin user not found'], 404);
    if ($u->role === 'admin' && !$superAdminsLeft($id)) return response()->json(['error' => 'At least one active Super Admin is required'], 422);
    DB::table('Session')->where('userId', $id)->delete();
    DB::table('User')->where('id', $id)->delete();
    return ['ok' => true];
});

/* ===================== Settings ===================== */

Route::get('/settings', function (Request $r) {
    $u = Admin::guard($r, 'settings');
    $current = $r->cookie('aw_session');
    $out = [
        'profile' => ['name' => $u->name, 'email' => $u->email, 'avatar' => $u->avatar, 'role' => Admin::ROLES[$u->role]],
        'notifications' => array_replace(['order' => true, 'customer' => true, 'chat' => true, 'stock' => true, 'review' => true], json_decode($u->notifyPrefs ?: '{}', true) ?: []),
        'sessions' => DB::table('Session')->where('userId', $u->id)->where('expiresAt', '>', now())->orderByDesc('createdAt')->get()
            ->map(fn ($s) => ['id' => $s->id, 'createdAt' => $s->createdAt, 'expiresAt' => $s->expiresAt, 'remember' => (bool) $s->remember, 'current' => $s->token === $current]),
        'website' => null,
    ];
    if ($u->role === 'admin') {
        $out['website'] = [
            'storeName' => Admin::setting('storeName', 'Novette Watches'), 'logo' => Admin::setting('logo'),
            'contactEmail' => Admin::setting('contactEmail', 'novettewatches@gmail.com'), 'supportPhone' => Admin::setting('supportPhone', '+1 800 555 0148'),
            'address' => Admin::setting('address', ''), 'announcement' => Admin::setting('announcement', ''),
            'gaMeasurementId' => Admin::setting('gaMeasurementId', ''), 'searchConsoleCode' => Admin::setting('searchConsoleCode', ''),
            'socials' => array_replace(['instagram' => '', 'facebook' => '', 'x' => '', 'youtube' => '', 'tiktok' => ''], Admin::setting('socials', []) ?: []),
        ];
    }
    return $out;
});

Route::put('/settings/profile', function (Request $r) {
    $u = Admin::guard($r, 'settings');
    $d = $r->validate(['name' => 'required|string|min:2|max:120', 'email' => "required|email|max:255|unique:User,email,{$u->id},id", 'avatar' => 'nullable|string|max:255']);
    DB::table('User')->where('id', $u->id)->update($d);
    return ['ok' => true];
});

Route::put('/settings/password', function (Request $r) {
    $u = Admin::guard($r, 'settings');
    $d = $r->validate(['current' => 'required|string', 'password' => 'required|string|min:8|max:200|confirmed|different:current'],
        ['password.confirmed' => 'New passwords do not match', 'password.different' => 'New password must differ from the current one']);
    if (!Hash::check($d['current'], $u->passwordHash)) return response()->json(['error' => 'Current password is incorrect', 'errors' => ['current' => ['Current password is incorrect']]], 422);
    DB::table('User')->where('id', $u->id)->update(['passwordHash' => Hash::make($d['password'])]);
    DB::table('Session')->where('userId', $u->id)->where('token', '!=', $r->cookie('aw_session'))->delete();
    return ['ok' => true];
});

Route::delete('/settings/sessions/others', function (Request $r) {
    $u = Admin::guard($r, 'settings');
    $n = DB::table('Session')->where('userId', $u->id)->where('token', '!=', $r->cookie('aw_session'))->delete();
    return ['ok' => true, 'revoked' => $n];
});

Route::delete('/settings/sessions/{id}', function (Request $r, string $id) {
    $u = Admin::guard($r, 'settings');
    DB::table('Session')->where('userId', $u->id)->where('id', $id)->delete();
    return ['ok' => true];
});

Route::put('/settings/notifications', function (Request $r) {
    $u = Admin::guard($r, 'settings');
    $d = $r->validate(['order' => 'boolean', 'customer' => 'boolean', 'chat' => 'boolean', 'stock' => 'boolean', 'review' => 'boolean']);
    DB::table('User')->where('id', $u->id)->update(['notifyPrefs' => json_encode($d)]);
    return ['ok' => true];
});

Route::put('/settings/website', function (Request $r) {
    $u = Admin::guard($r, 'settings');
    if ($u->role !== 'admin') return response()->json(['error' => 'Only a Super Admin can change website settings'], 403);
    $d = $r->validate([
        'storeName' => 'required|string|max:120', 'logo' => 'nullable|string|max:255',
        'contactEmail' => 'required|email', 'supportPhone' => 'required|string|max:40', 'address' => 'nullable|string|max:255',
        'announcement' => 'nullable|string|max:255', 'socials' => 'nullable|array', 'socials.*' => 'nullable|url|max:255',
        'gaMeasurementId' => ['nullable', 'string', 'regex:/^G-[A-Z0-9]{4,15}$/'],
        'searchConsoleCode' => ['nullable', 'string', 'max:120', 'regex:/^[A-Za-z0-9_\-]+$/'],
    ], [
        'socials.*.url' => 'Social links must be full URLs (https://…)',
        'gaMeasurementId.regex' => 'Measurement ID looks like G-XXXXXXXXXX',
        'searchConsoleCode.regex' => 'Paste only the content value from the Google verification meta tag',
    ]);
    foreach ($d as $k => $v) Admin::putSetting($k, $v);
    $content = Admin::setting('content', []);
    $content['contact'] = array_replace($content['contact'] ?? [], ['phone' => $d['supportPhone'], 'email' => $d['contactEmail'], 'address' => $d['address'] ?? '']);
    if (isset($d['socials'])) $content['socials'] = $d['socials'];
    Admin::putSetting('content', $content);
    return ['ok' => true];
});
