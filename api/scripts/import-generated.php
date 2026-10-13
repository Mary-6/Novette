<?php
// Usage: php scripts/import-generated.php
// Adds catalogue models from watch-list.php that have no licensed photo, using the
// generated studio image at public/images/watches/{slug}/render-1.jpg.

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

require __DIR__ . '/watch-list.php';

$SKIP = ['vacheron-constantin-fiftysix-4600e000a-b442', 'hublot-big-bang-unico-titanium-421nx1170rx', 'hublot-classic-fusion-titanium-542nx1171rx'];
$prefix = ['rolex' => 'rlx', 'omega' => 'om', 'patek-philippe' => 'pp', 'audemars-piguet' => 'ap', 'cartier' => 'ca', 'breitling' => 'br', 'tag-heuer' => 'tag', 'tudor' => 'tud', 'hublot' => 'hub', 'iwc' => 'iwc', 'panerai' => 'pan', 'jaeger-lecoultre' => 'jlc', 'vacheron-constantin' => 'vc', 'grand-seiko' => 'gs', 'richard-mille' => 'rm'];
$public = realpath(__DIR__ . '/../public');

$added = 0;
foreach ($W as $i => [$brand, $model, $ref, $nick, $price, $year, $type, $mat, $gender, $cat, , , $specs]) {
    $slug = Str::slug("$brand $model $ref");
    if (in_array($slug, $SKIP, true)) continue;
    if (DB::table('Watch')->where('slug', $slug)->orWhere(fn ($q) => $q->where('brandSlug', $brand)->where('reference', $ref))->exists()) continue;
    $img = "/images/watches/$slug/render-1.jpg";
    if (!is_file($public . $img)) { echo "NO IMAGE  $slug\n"; continue; }

    $n = DB::table('Watch')->where('brandSlug', $brand)->count() + 1;
    do { $id = $prefix[$brand] . '-' . str_pad((string) $n++, 2, '0', STR_PAD_LEFT); } while (DB::table('Watch')->where('id', $id)->exists());
    $specs['caseMaterial'] ??= $mat;
    DB::table('Watch')->insert([
        'id' => $id, 'slug' => $slug, 'brandSlug' => $brand, 'model' => $model, 'reference' => $ref, 'nickname' => $nick,
        'price' => $price, 'year' => $year, 'type' => $type, 'material' => $mat, 'condition' => $year >= 2020 ? 'Unworn' : 'Excellent',
        'gender' => $gender, 'boxPapers' => 1, 'isNew' => $year >= 2023 ? 1 : 0, 'isFeatured' => 0, 'isBestSeller' => 0,
        'popularity' => 50, 'addedAt' => now(), 'updatedAt' => now(),
        'description' => "The {$model} (ref. {$ref}), inspected, timed and certified by our horologists before shipping fully insured.",
        'specs' => json_encode($specs), 'inventory' => 5 + ($i % 6), 'lowStockAt' => 1, 'salePrice' => null,
        'categorySlug' => $cat, 'active' => 1, 'images' => json_encode([$img]),
        'sku' => 'NV-' . strtoupper(substr(preg_replace('/[^a-z]/', '', $brand), 0, 3)) . '-' . strtoupper(preg_replace('/\s+/', '', $ref)),
    ]);
    $added++;
    echo "ADDED  $id  $brand $model\n";
}
echo "\nAdded $added watches.\n";
