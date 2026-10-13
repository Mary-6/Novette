<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;

class Catalog
{
    public static function data(string $name): array
    {
        if ($name === 'brands') return self::brands();
        if ($name === 'faq') return self::faqs();
        static $cache = [];
        if (!isset($cache[$name])) {
            $cache[$name] = json_decode(file_get_contents(resource_path("data/{$name}.json")), true);
        }
        return $cache[$name];
    }

    public static function brands(): array
    {
        static $brands = null;
        if ($brands === null) {
            $brands = DB::table('Brand')->orderBy('name')->get()->map(fn ($b) => (array) $b)->all();
        }
        return $brands;
    }

    public static function faqs(): array
    {
        return DB::table('Faq')->orderBy('sortOrder')->get()
            ->map(fn ($f) => ['category' => $f->category, 'q' => $f->question, 'a' => $f->answer])->all();
    }

    public static function testimonials(): array
    {
        $rows = DB::table('Review')->where('status', 'approved')->orderByDesc('createdAt')->limit(12)->get();
        if ($rows->isEmpty()) return self::data('reviews');
        return $rows->map(fn ($r) => [
            'name' => $r->author, 'location' => $r->watchId ? '' : (string) $r->title,
            'rating' => (float) $r->rating, 'text' => $r->body,
        ])->all();
    }

    public static function images(string $slug): array
    {
        $all = self::data('watchImages');
        return $all[$slug] ?? [];
    }

    /** Image $i of a watch row, honouring admin-managed images before the static index. */
    public static function cover(?object $w, int $i = 0): ?string
    {
        if (!$w) return null;
        $own = isset($w->images) ? (is_string($w->images) ? json_decode($w->images, true) : $w->images) : null;
        $imgs = $own ?: self::images($w->slug);
        return $imgs[$i] ?? $imgs[0] ?? null;
    }

    public static function decorate(object $w): object
    {
        $own = isset($w->images) && is_string($w->images) ? json_decode($w->images, true) : null;
        $w->images = $own ?: self::images($w->slug);
        $w->image = $w->images[0] ?? null;
        $w->specs = is_string($w->specs) ? json_decode($w->specs, true) : $w->specs;
        $w->available = $w->inventory > 0;
        $w->onSale = !empty($w->salePrice) && $w->salePrice < $w->price;
        return $w;
    }

    public static function watches(array $filters = []): array
    {
        $q = DB::table('Watch')->where('inventory', '>', 0)->where('active', 1);
        if (!empty($filters['q'])) {
            $term = '%' . $filters['q'] . '%';
            $q->where(fn ($w) => $w->orWhere('model', 'like', $term)
                ->orWhere('reference', 'like', $term)
                ->orWhere('brandSlug', 'like', $term)
                ->orWhere('nickname', 'like', $term));
        }
        foreach (['brand' => 'brandSlug', 'type' => 'type', 'gender' => 'gender', 'condition' => 'condition'] as $p => $f) {
            if (!empty($filters[$p])) $q->where($f, $filters[$p]);
        }
        match ($filters['sort'] ?? null) {
            'price-asc' => $q->orderBy('price'),
            'price-desc' => $q->orderByDesc('price'),
            'newest' => $q->orderByDesc('addedAt'),
            default => $q->orderByDesc('popularity'),
        };
        return $q->get()->map(fn ($w) => self::decorate($w))->all();
    }

    public static function watch(string $slug): ?object
    {
        $w = DB::table('Watch')->where('slug', $slug)->where('active', 1)->first();
        return $w ? self::decorate($w) : null;
    }

    public static function brandName(string $slug): string
    {
        foreach (self::data('brands') as $b) {
            if ($b['slug'] === $slug) return $b['name'];
        }
        return ucwords(str_replace('-', ' ', $slug));
    }

    public static function price(int $cents): string
    {
        return '$' . number_format($cents);
    }

    public static function logoSvg(string $class = 'h-9 w-9'): string
    {
        $ticks = '';
        for ($i = 0; $i < 12; $i++) {
            $a = deg2rad($i * 30);
            $x1 = 24 + 19.5 * sin($a); $y1 = 24 - 19.5 * cos($a);
            $x2 = 24 + 22 * sin($a);   $y2 = 24 - 22 * cos($a);
            $sw = $i % 3 === 0 ? 1.6 : 0.9;
            $ticks .= '<line x1="' . round($x1, 2) . '" y1="' . round($y1, 2) . '" x2="' . round($x2, 2) . '" y2="' . round($y2, 2) . '" stroke="#C9A24C" stroke-width="' . $sw . '"/>';
        }
        return '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="' . $class . '" aria-hidden="true">'
            . '<circle cx="24" cy="24" r="22" stroke="#C9A24C" stroke-width="1.5"/>'
            . '<circle cx="24" cy="24" r="17.5" stroke="#C9A24C" stroke-width="0.75" opacity="0.6"/>'
            . $ticks
            . '<path d="M18.5 32V16h2.4l9 12.5V16h2.6v16h-2.4l-9-12.5V32h-2.6Z" fill="#C9A24C"/>'
            . '<path d="M20 13l4-2.6 4 2.6" stroke="#C9A24C" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
            . '</svg>';
    }
}
