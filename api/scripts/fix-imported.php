<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

$pub = realpath(__DIR__ . '/../public');
$img = fn($slug, $files) => json_encode(array_map(fn($f) => "/images/watches/$slug/$f", $files));

function drop(string $pub, string $slug, array $files): void
{
    foreach ($files as $f) @unlink("$pub/images/watches/$slug/$f");
}

function rename_watch(string $pub, string $old, array $fields, array $files): void
{
    $w = DB::table('Watch')->where('slug', $old)->first();
    if (!$w) { echo "missing $old\n"; return; }
    $new = Str::slug($w->brandSlug . ' ' . ($fields['model'] ?? $w->model) . ' ' . ($fields['reference'] ?? $w->reference));
    if ($new !== $old) rename("$pub/images/watches/$old", "$pub/images/watches/$new");
    $fields['slug'] = $new;
    $fields['images'] = json_encode(array_map(fn($f) => "/images/watches/$new/$f", $files));
    $fields['updatedAt'] = now();
    if (isset($fields['reference'])) $fields['sku'] = 'NV-' . strtoupper(substr(preg_replace('/[^a-z]/', '', $w->brandSlug), 0, 3)) . '-' . strtoupper(preg_replace('/\s+/', '', $fields['reference']));
    DB::table('Watch')->where('slug', $old)->update($fields);
    echo "renamed $old -> $new\n";
}

// Reorder / drop off-subject shots
$c = 'omega-constellation-13110292055001';
drop($pub, $c, ['photo-2.jpg', 'photo-3.jpg']);
DB::table('Watch')->where('slug', $c)->update(['images' => $img($c, ['photo-4.jpg', 'photo-1.jpg'])]);

$s = 'jaeger-lecoultre-reverso-classic-q3858520';
drop($pub, $s, ['photo-2.jpg']);
DB::table('Watch')->where('slug', $s)->update(['images' => $img($s, ['photo-3.jpg', 'photo-1.jpg'])]);

$s = 'breitling-colt-automatic-a17388';
DB::table('Watch')->where('slug', $s)->update(['images' => $img($s, ['photo-2.jpg', 'photo-3.jpg', 'photo-1.jpg'])]);

$s = 'tag-heuer-aquaracer-professional-300-wbp201aba0632';
DB::table('Watch')->where('slug', $s)->update(['images' => $img($s, ['photo-3.jpg', 'photo-1.jpg', 'photo-2.jpg'])]);

$s = 'tag-heuer-autavia-cbe2110ba0687';
drop($pub, $s, ['photo-2.jpg']);
DB::table('Watch')->where('slug', $s)->update(['images' => $img($s, ['photo-1.jpg', 'photo-3.jpg'])]);

$s = 'tag-heuer-formula-1-waz1110ba0875';
DB::table('Watch')->where('slug', $s)->update(['images' => $img($s, ['photo-2.jpg', 'photo-3.jpg', 'photo-1.jpg'])]);

// Align listings with what the photos actually show
rename_watch($pub, 'patek-philippe-grand-complications-perpetual-calendar-5327g-001', [
    'model' => 'Nautilus Perpetual Calendar', 'reference' => '5740/1G-001', 'price' => 265000, 'material' => '18k white gold', 'type' => 'Complication',
    'description' => 'The Nautilus Perpetual Calendar (ref. 5740/1G-001) in 18k white gold with a blue embossed dial and moon phase, inspected, timed and certified by our horologists before shipping fully insured.',
    'specs' => json_encode(['caliber' => '240 Q', 'caseDiameter' => '40mm', 'dialColor' => 'Blue gradient, embossed', 'waterResistance' => '60m', 'functions' => 'Perpetual calendar, moon phase, 24-hour, leap year', 'caseMaterial' => '18k white gold', 'bracelet' => 'Integrated white gold bracelet']),
], ['photo-1.jpg']);

rename_watch($pub, 'tudor-submariner-snowflake-94110', [
    'model' => 'Submariner', 'reference' => '7928', 'nickname' => null, 'year' => 1964,
    'description' => 'A vintage Tudor Submariner (ref. 7928) with a black gilt dial and crown guards, inspected, timed and certified by our horologists before shipping fully insured.',
    'specs' => json_encode(['caliber' => 'Tudor 390', 'caseDiameter' => '40mm', 'dialColor' => 'Black gilt', 'waterResistance' => '200m (as rated)', 'functions' => 'Hours, minutes, seconds', 'caseMaterial' => 'Stainless steel', 'bracelet' => 'Riveted Oyster bracelet']),
], ['photo-1.jpg']);

rename_watch($pub, 'vacheron-constantin-fiftysix-4600e000a-b442', [
    'model' => 'Fiftysix Complete Calendar', 'reference' => '4000E/000A-B439', 'price' => 21500,
    'description' => 'The Fiftysix Complete Calendar (ref. 4000E/000A-B439) with day, date, month and moon phase, inspected, timed and certified by our horologists before shipping fully insured.',
    'specs' => json_encode(['caliber' => '2460 QCL/1', 'caseDiameter' => '40mm', 'dialColor' => 'Silver', 'waterResistance' => '30m', 'functions' => 'Hours, minutes, seconds, day, date, month, moon phase', 'caseMaterial' => 'Stainless steel']),
], ['photo-1.jpg']);

DB::table('Watch')->where('slug', 'vacheron-constantin-patrimony-81180000g-9117')->update(['material' => '18k yellow gold', 'specs' => json_encode(['caliber' => '1400', 'caseDiameter' => '40mm', 'dialColor' => 'Silver opaline', 'waterResistance' => '30m', 'functions' => 'Hours, minutes', 'caseMaterial' => '18k yellow gold'])]);

// Grand Seiko photo was a different (vintage) model
$gs = 'grand-seiko-evolution-9-hi-beat-slgh005';
DB::table('Watch')->where('slug', $gs)->delete();
array_map('unlink', glob("$pub/images/watches/$gs/*"));
@rmdir("$pub/images/watches/$gs");

// Omega Speedmaster "Silver Snoopy Award"
$sn = 'omega-speedmaster-silver-snoopy-award-50th-anniversary-31032425002001';
if (!DB::table('Watch')->where('slug', $sn)->exists()) {
    DB::table('Watch')->insert([
        'id' => 'om-07', 'slug' => $sn, 'brandSlug' => 'omega', 'model' => 'Speedmaster "Silver Snoopy Award" 50th Anniversary',
        'reference' => '310.32.42.50.02.001', 'nickname' => 'Silver Snoopy', 'price' => 9600, 'year' => 2023, 'type' => 'Chronograph',
        'material' => 'Stainless steel', 'condition' => 'Unworn', 'gender' => 'Men', 'boxPapers' => 1, 'isNew' => 1, 'isFeatured' => 1,
        'isBestSeller' => 0, 'popularity' => 90, 'addedAt' => now(), 'updatedAt' => now(),
        'description' => "Celebrating 50 years since NASA's Silver Snoopy Award to Omega for Apollo 13: silver dial, blue ceramic bezel, Snoopy astronaut at 9 o'clock and an animated caseback. Inspected, timed and certified by our horologists before shipping fully insured.",
        'specs' => json_encode(['caliber' => 'Omega 3861', 'caseDiameter' => '42mm', 'dialColor' => 'Silver with blue enamel', 'waterResistance' => '50m', 'functions' => 'Hours, minutes, small seconds, chronograph', 'caseMaterial' => 'Stainless steel', 'bracelet' => 'Blue/white NATO strap', 'movement' => 'Manual winding', 'powerReserve' => '50 hours']),
        'inventory' => 2, 'lowStockAt' => 1, 'salePrice' => null, 'categorySlug' => 'sports-watches', 'active' => 1,
        'images' => $img($sn, ['photo-1.jpg']), 'sku' => 'NV-OME-310.32.42.50.02.001',
    ]);
    echo "added snoopy\n";
}
echo "done\n";
