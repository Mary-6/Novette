<?php
// Adds watches whose photos are specific Wikimedia Commons files (license-checked).
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

const UA = 'NovetteWatches/1.0 (catalogue import; novettewatches@gmail.com)';
$pub = realpath(__DIR__ . '/../public');

function get(string $url): ?string
{
    $ctx = stream_context_create(['http' => ['header' => 'User-Agent: ' . UA, 'timeout' => 30]]);
    for ($i = 0; $i < 3; $i++) { $r = @file_get_contents($url, false, $ctx); if ($r !== false) return $r; sleep(2); }
    return null;
}

function info(array $titles): array
{
    $j = json_decode(get('https://commons.wikimedia.org/w/api.php?' . http_build_query([
        'action' => 'query', 'titles' => implode('|', $titles), 'prop' => 'imageinfo',
        'iiprop' => 'url|extmetadata', 'iiurlwidth' => 1200, 'format' => 'json',
    ])) ?? '{}', true);
    $out = [];
    foreach (($j['query']['pages'] ?? []) as $p) {
        $ii = $p['imageinfo'][0] ?? null;
        if (!$ii) continue;
        $out[$p['title']] = ['thumb' => $ii['thumburl'] ?? $ii['url'], 'license' => $ii['extmetadata']['LicenseShortName']['value'] ?? ''];
    }
    return $out;
}

$prefix = ['cartier' => 'ca', 'grand-seiko' => 'gs', 'hublot' => 'hub', 'panerai' => 'pan', 'richard-mille' => 'rm'];

// [brand, model, ref, price, year, type, material, gender, category, files[], specs]
$W = [
    ['richard-mille', 'RM 030 Automatic Declutchable Rotor', 'RM 030', 145000, 2016, 'Sport', 'Titanium', 'Men', 'luxury-watches', ['File:RM 030 Automatic.jpg', 'File:RM 030 Automatic (2).jpg'], ['caliber' => 'RMAR1', 'caseDiameter' => '50 x 42.7mm', 'dialColor' => 'Skeleton', 'waterResistance' => '50m', 'functions' => 'Hours, minutes, seconds, date, declutchable rotor']],
    ['richard-mille', 'RM 016 Automatic Extra Flat', 'RM 016', 128000, 2015, 'Dress', 'Titanium', 'Men', 'luxury-watches', ['File:RM 016 Automatic Extra Plat.jpg', 'File:RM 016 Automatic Extra Plat (2).jpg', 'File:RM 016 Automatic Extra Plat (3).jpg'], ['caliber' => 'RMAS7', 'caseDiameter' => '49.8 x 38mm', 'dialColor' => 'Skeleton', 'waterResistance' => '50m', 'functions' => 'Hours, minutes, seconds, date']],
    ['richard-mille', 'RM 07-01 Ladies Automatic', 'RM 07-01', 165000, 2019, 'Dress', 'Ceramic and gold', 'Women', 'womens-watches', ['File:RM 07-01 Ladies.jpg', 'File:RM 07-01 Ladies (2).jpg', 'File:RM 07-01 Ladies (3).jpg'], ['caliber' => 'CRMA2', 'caseDiameter' => '45.7 x 31.4mm', 'dialColor' => 'Skeleton', 'waterResistance' => '50m', 'functions' => 'Hours, minutes']],
    ['richard-mille', 'RM 70-01 Tourbillon Alain Prost', 'RM 70-01', 1250000, 2018, 'Complication', 'Carbon TPT and titanium', 'Men', 'luxury-watches', ['File:RM 70-01 Tourbillon Alain Prost.jpg', 'File:RM 70-01 Tourbillon Alain Prost (2).jpg', 'File:RM 70-01 Tourbillon Alain Prost (3).jpg'], ['caliber' => 'RM70-01', 'caseDiameter' => '54.6 x 42.4mm', 'dialColor' => 'Skeleton', 'waterResistance' => '30m', 'functions' => 'Tourbillon, odometer, hours, minutes']],
    ['richard-mille', 'RM 60-01 Flyback Chronograph Regatta', 'RM 60-01', 225000, 2016, 'Chronograph', 'Titanium', 'Men', 'sports-watches', ['File:RM 60-01 Flyback Chronograph Regatta.jpg'], ['caliber' => 'RMAC2', 'caseDiameter' => '50mm', 'dialColor' => 'Skeleton', 'waterResistance' => '50m', 'functions' => 'Flyback chronograph, regatta countdown, GMT, compass bezel']],
    ['grand-seiko', 'Heritage Automatic', 'SBGR051', 4700, 2016, 'Dress', 'Stainless steel', 'Men', 'dress-watches', ['File:SBGR051.jpg', 'File:Grand Seiko SBGR051 sideview.JPG'], ['caliber' => '9S65', 'caseDiameter' => '37mm', 'dialColor' => 'Silver', 'waterResistance' => '100m', 'functions' => 'Hours, minutes, seconds, date']],
    ['grand-seiko', 'Elegance Manual-Wind', 'SBGW231', 4900, 2019, 'Dress', 'Stainless steel', 'Men', 'dress-watches', ['File:Grand Seiko SBGW231 sideview.JPG'], ['caliber' => '9S64', 'caseDiameter' => '37.3mm', 'dialColor' => 'Ivory', 'waterResistance' => '30m', 'functions' => 'Hours, minutes, seconds']],
    ['grand-seiko', 'Spring Drive Power Reserve', 'SBGA011', 5900, 2012, 'Sport', 'High-intensity titanium', 'Men', 'sports-watches', ['File:Grand Seiko SBGA011.jpg'], ['caliber' => '9R65', 'caseDiameter' => '41mm', 'dialColor' => 'Black', 'waterResistance' => '100m', 'functions' => 'Hours, minutes, seconds, date, power reserve']],
    ['grand-seiko', 'Heritage Automatic Cream Dial', 'SBGR037', 4200, 2012, 'Dress', 'Stainless steel', 'Men', 'dress-watches', ['File:Grandseiko-sbgr037.jpg'], ['caliber' => '9S65', 'caseDiameter' => '37mm', 'dialColor' => 'Cream', 'waterResistance' => '100m', 'functions' => 'Hours, minutes, seconds, date']],
    ['hublot', 'Classic GMT (Vintage)', '1810.1', 3900, 1992, 'GMT', 'Stainless steel', 'Men', 'mens-watches', ['File:Hublot GMT, inizio anni \'90.jpg'], ['caliber' => 'Automatic', 'caseDiameter' => '40mm', 'dialColor' => 'Black', 'waterResistance' => '50m', 'functions' => 'Hours, minutes, seconds, date, GMT']],
    ['hublot', 'Classic Chronograph (Vintage)', '1620.1', 4500, 1995, 'Chronograph', 'Stainless steel', 'Men', 'mens-watches', ['File:Hublot chrono.jpg'], ['caliber' => 'Automatic chronograph', 'caseDiameter' => '40mm', 'dialColor' => 'Black', 'waterResistance' => '50m', 'functions' => 'Chronograph, date']],
    ['cartier', 'Santos Galbée', '1564', 3900, 1990, 'Dress', 'Stainless steel and gold', 'Unisex', 'dress-watches', ['File:Cartier Santos Galbée ref. 1564.jpg', 'File:Cartier Santos Galbée al quarzo, ref. 1564.jpg'], ['caliber' => 'Cartier 87', 'caseDiameter' => '29mm', 'dialColor' => 'Ivory', 'waterResistance' => '30m', 'functions' => 'Hours, minutes, seconds, date']],
    ['cartier', 'Santos Octagon', '2966', 4600, 1989, 'Dress', 'Stainless steel and gold', 'Men', 'mens-watches', ['File:Cartier Santos Octagon automatico, fine anni \'80.jpg'], ['caliber' => 'Automatic', 'caseDiameter' => '30mm', 'dialColor' => 'Ivory', 'waterResistance' => '30m', 'functions' => 'Hours, minutes, seconds, date']],
    ['cartier', 'Tank Solo XL', '3800', 3600, 2016, 'Dress', 'Stainless steel', 'Men', 'dress-watches', ['File:Cartier Tank Solo XL ref. 3800.jpg'], ['caliber' => '049', 'caseDiameter' => '31 x 40.85mm', 'dialColor' => 'Silver', 'waterResistance' => '30m', 'functions' => 'Hours, minutes, seconds, date']],
    ['cartier', 'Santos 100 Medium', 'W20106X8', 5600, 2012, 'Sport', 'Stainless steel', 'Unisex', 'luxury-watches', ['File:Cartier Santos 100 medium.jpg'], ['caliber' => '049', 'caseDiameter' => '33mm', 'dialColor' => 'Silver', 'waterResistance' => '100m', 'functions' => 'Hours, minutes, seconds']],
    ['panerai', 'Luminor Marina', 'PAM00111', 5400, 2014, 'Sport', 'Stainless steel', 'Men', 'sports-watches', ['File:PANERAI (29802698304).jpg', 'File:LUMINOR (30075754506).jpg', 'File:CROWN GUARD (29728851024).jpg'], ['caliber' => 'OP XI', 'caseDiameter' => '44mm', 'dialColor' => 'Black', 'waterResistance' => '300m', 'functions' => 'Hours, minutes, small seconds']],
];

$all = info(array_merge(...array_map(fn($w) => $w[9], $W)));
foreach ($W as [$brand, $model, $ref, $price, $year, $type, $mat, $gender, $cat, $files, $specs]) {
    $slug = Str::slug("$brand $model $ref");
    if (DB::table('Watch')->where('slug', $slug)->exists()) { echo "EXISTS $slug\n"; continue; }
    $dir = "$pub/images/watches/$slug"; @mkdir($dir, 0775, true);
    $paths = [];
    foreach ($files as $i => $t) {
        $m = $all[str_replace('_', ' ', $t)] ?? null;
        if (!$m) { echo "  no info $t\n"; continue; }
        if ($m['license'] === '' || preg_match('/(NC|ND|Non-free|Fair use)/i', $m['license'])) { echo "  bad license {$m['license']} $t\n"; continue; }
        $bin = get($m['thumb']);
        if (!$bin) continue;
        file_put_contents("$dir/photo-" . ($i + 1) . '.jpg', $bin);
        $paths[] = "/images/watches/$slug/photo-" . ($i + 1) . '.jpg';
        usleep(300000);
    }
    if (!$paths) { @rmdir($dir); echo "NO PHOTO $model\n"; continue; }
    $n = DB::table('Watch')->where('brandSlug', $brand)->count() + 1;
    do { $id = $prefix[$brand] . '-' . str_pad((string) $n++, 2, '0', STR_PAD_LEFT); } while (DB::table('Watch')->where('id', $id)->exists());
    $specs['caseMaterial'] ??= $mat;
    DB::table('Watch')->insert([
        'id' => $id, 'slug' => $slug, 'brandSlug' => $brand, 'model' => $model, 'reference' => $ref, 'nickname' => null,
        'price' => $price, 'year' => $year, 'type' => $type, 'material' => $mat, 'condition' => $year >= 2020 ? 'Unworn' : 'Excellent',
        'gender' => $gender, 'boxPapers' => $year >= 2000 ? 1 : 0, 'isNew' => 0, 'isFeatured' => 0, 'isBestSeller' => 0,
        'popularity' => 50, 'addedAt' => now(), 'updatedAt' => now(),
        'description' => "The {$model} (ref. {$ref}), inspected, timed and certified by our horologists before shipping fully insured.",
        'specs' => json_encode($specs), 'inventory' => 1, 'lowStockAt' => 1, 'salePrice' => null,
        'categorySlug' => $cat, 'active' => 1, 'images' => json_encode($paths),
        'sku' => 'NV-' . strtoupper(substr(preg_replace('/[^a-z]/', '', $brand), 0, 3)) . '-' . strtoupper(preg_replace('/\s+/', '', $ref)),
    ]);
    echo "ADDED $id $model (" . count($paths) . ")\n";
}
