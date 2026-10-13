<?php

namespace App\Support;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class Admin
{
    public const ROLES = [
        'admin' => 'Super Admin',
        'product_manager' => 'Product Manager',
        'order_manager' => 'Order Manager',
        'chat_support' => 'Chat Support',
    ];

    /** Sections each role may access. Super Admin ('admin') gets everything. */
    public const PERMISSIONS = [
        'product_manager' => ['dashboard', 'products', 'categories', 'brands', 'inventory', 'reviews', 'promotions', 'settings', 'notifications'],
        'order_manager' => ['dashboard', 'orders', 'customers', 'settings', 'notifications'],
        'chat_support' => ['dashboard', 'chat', 'settings', 'notifications'],
    ];

    public const SECTIONS = [
        'dashboard', 'products', 'categories', 'brands', 'orders', 'customers', 'chat', 'inventory',
        'reviews', 'promotions', 'analytics', 'content', 'users', 'settings', 'notifications',
    ];

    /** Notification types visible to each section permission. */
    public const NOTIFY_SECTION = [
        'order' => 'orders', 'customer' => 'customers', 'chat' => 'chat',
        'low_stock' => 'inventory', 'out_of_stock' => 'inventory', 'review' => 'reviews',
    ];

    public static function id(): string
    {
        return 'c' . uniqid() . bin2hex(random_bytes(8));
    }

    public static function isStaff($u): bool
    {
        return $u && array_key_exists($u->role, self::ROLES) && ($u->isActive ?? 1);
    }

    public static function sections($u): array
    {
        if (!self::isStaff($u)) return [];
        return $u->role === 'admin' ? self::SECTIONS : self::PERMISSIONS[$u->role];
    }

    public static function can($u, string $section): bool
    {
        return in_array($section, self::sections($u), true);
    }

    /** Abort with JSON 401/403 unless the request user may access $section. */
    public static function guard(Request $r, string $section)
    {
        $u = $r->attributes->get('user');
        if (!$u) abort(response()->json(['error' => 'Authentication required'], 401));
        if (!self::isStaff($u)) abort(response()->json(['error' => 'Admin access required'], 403));
        if (!self::can($u, $section)) abort(response()->json(['error' => 'You do not have permission for this section'], 403));
        return $u;
    }

    public static function notify(string $type, string $title, ?string $body = null, ?string $link = null): void
    {
        try {
            DB::table('Notification')->insert([
                'id' => self::id(), 'type' => $type, 'title' => $title, 'body' => $body,
                'link' => $link, 'read' => 0, 'createdAt' => now()->toDateTimeString(),
            ]);
        } catch (\Throwable $e) {
            \Log::warning('[notify] ' . $e->getMessage());
        }
    }

    public static function stockStatus($w): string
    {
        $inv = (int) $w->inventory;
        if ($inv <= 0) return 'out';
        return $inv <= (int) ($w->lowStockAt ?? 2) ? 'low' : 'in';
    }

    /** Raise low/out-of-stock notifications after inventory changes. */
    public static function checkStock(string $watchId): void
    {
        $w = DB::table('Watch')->where('id', $watchId)->first();
        if (!$w) return;
        $s = self::stockStatus($w);
        if ($s === 'out') self::notify('out_of_stock', "Out of stock: {$w->model}", "Ref. {$w->reference} has 0 units left.", '/admin/inventory');
        elseif ($s === 'low') self::notify('low_stock', "Low stock: {$w->model}", "Only {$w->inventory} left (ref. {$w->reference}).", '/admin/inventory');
    }

    public static function setting(string $key, $default = null)
    {
        $row = DB::table('SiteSetting')->where('key', $key)->first();
        if (!$row) return $default;
        $v = json_decode($row->value, true);
        return $v ?? $default;
    }

    public static function putSetting(string $key, $value): void
    {
        DB::table('SiteSetting')->upsert(
            ['key' => $key, 'value' => json_encode($value), 'updatedAt' => now()->toDateTimeString()],
            ['key'], ['value', 'updatedAt']
        );
    }

    public static function online($u): bool
    {
        return $u && $u->lastActiveAt && strtotime($u->lastActiveAt) > time() - 90;
    }
}
