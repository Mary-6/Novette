<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use App\Support\Catalog;
use App\Support\Admin;

$watch = fn ($w) => Catalog::decorate($w);

Route::get('/', function () {
    $featured = DB::table('Watch')->where('active', 1)->where('isFeatured', true)->where('inventory', '>', 0)
        ->orderByDesc('popularity')->limit(8)->get()->map(Catalog::decorate(...));
    $newest = DB::table('Watch')->where('active', 1)->where('inventory', '>', 0)
        ->orderByDesc('addedAt')->limit(4)->get()->map(Catalog::decorate(...));
    $content = array_replace_recursive(['hero' => [], 'promo' => ['enabled' => false]], Admin::setting('content', []));
    return view('home', [
        'featured' => $featured,
        'newest' => $newest,
        'hero' => array_replace(['title' => 'Timeless Luxury.', 'highlight' => 'Iconic Timepieces.', 'subtitle' => "New and unworn watches from the world's great maisons, every piece inspected, timed and certified by our master horologists.", 'ctaLabel' => 'Shop the Collection', 'ctaLink' => '/shop'], $content['hero'] ?? []),
        'heroImgs' => $content['hero']['images'] ?? [],
        'promo' => $content['promo'],
        'brands' => Catalog::data('brands'),
        'collections' => Catalog::data('collections'),
        'rolexFamilies' => Catalog::data('rolexFamilies'),
        'reviews' => Catalog::testimonials(),
        'articles' => Catalog::data('journal'),
    ]);
});

Route::get('/shop', function () {
    return view('shop', [
        'watches' => Catalog::watches(request()->only(['q','brand','type','gender','condition','min','max','sort'])),
        'brands' => Catalog::data('brands'),
    ]);
});

Route::get('/watches/{slug}', function (string $slug) {
    $w = Catalog::watch($slug);
    abort_unless($w, 404);
    $related = DB::table('Watch')->where('active', 1)->where('brandSlug', $w->brandSlug)
        ->where('slug', '!=', $slug)->where('inventory', '>', 0)
        ->orderByDesc('popularity')->limit(4)->get()->map(Catalog::decorate(...));
    return view('watch', ['w' => $w, 'related' => $related]);
});

Route::get('/brands', fn () => view('brands', ['brands' => Catalog::data('brands')]));

Route::get('/brands/{slug}', function (string $slug) {
    $brand = collect(Catalog::data('brands'))->firstWhere('slug', $slug);
    abort_unless($brand, 404);
    return view('brand', [
        'brand' => $brand,
        'watches' => Catalog::watches(['brand' => $slug] + request()->only('sort')),
    ]);
});

Route::get('/collections', fn () => view('collections', ['collections' => Catalog::data('collections')]));

Route::get('/collections/{slug}', function (string $slug) {
    $col = collect(Catalog::data('collections'))->firstWhere('slug', $slug);
    abort_unless($col, 404);
    $filters = [];
    if (str_contains($col['slug'], 'men') && !str_contains($col['slug'], 'women')) $filters['gender'] = 'Men';
    if (str_contains($col['slug'], 'women')) $filters['gender'] = 'Women';
    if (str_contains($col['slug'], 'sport')) $filters['type'] = 'Sport';
    if (str_contains($col['slug'], 'dress')) $filters['type'] = 'Dress';
    if (str_contains($col['slug'], 'dive')) $filters['type'] = 'Dive';
    if (str_contains($col['slug'], 'new')) $filters['condition'] = 'New';
    return view('collection', [
        'collection' => $col,
        'watches' => Catalog::watches($filters + request()->only('sort')),
    ]);
});

Route::get('/super-clone', function () {
    return view('super-clone', [
        'watches' => Catalog::watches(['brand' => 'super-clone']),
    ]);
});

Route::get('/rolex', function () {
    return view('rolex', [
        'watches' => Catalog::watches(['brand' => 'rolex']),
        'families' => Catalog::data('rolexFamilies'),
    ]);
});

Route::get('/rolex/{family}', function (string $family) {
    $f = collect(Catalog::data('rolexFamilies'))->firstWhere('slug', $family);
    abort_unless($f, 404);
    $all = Catalog::watches(['brand' => 'rolex']);
    $watches = array_values(array_filter($all, function ($w) use ($f) {
        return str_contains(strtolower($w->model ?? ''), str_replace('-', ' ', $f['slug']));
    }));
    return view('rolex-family', ['family' => $f, 'watches' => $watches, 'all' => count($all)]);
});

foreach (Catalog::data('pages') as $slug => $page) {
    Route::get('/' . $slug, function () use ($slug, $page) {
        return view('info', ['slug' => $slug, 'page' => $page]);
    });
}
Route::get('/about', fn () => redirect('/about-us', 301));
Route::get('/contact', fn () => redirect('/contact-us', 301));

Route::get('/journal', fn () => view('journal', ['articles' => Catalog::data('journal')]));
Route::get('/journal/{slug}', function (string $slug) {
    $a = collect(Catalog::data('journal'))->firstWhere('slug', $slug);
    abort_unless($a, 404);
    return view('article', ['a' => $a]);
});

Route::get('/contact-us', fn () => view('contact'));
Route::get('/login', fn () => view('auth', ['mode' => 'login']));
Route::get('/signup', fn () => view('auth', ['mode' => 'signup']));
Route::get('/forgot-password', fn () => view('auth', ['mode' => 'forgot']));
Route::get('/reset-password', fn () => view('auth', ['mode' => 'reset']));
Route::get('/verify-email', fn () => view('auth', ['mode' => 'verify']));
Route::get('/account', fn () => view('account'));
Route::get('/cart', fn () => view('cart'));
Route::get('/wishlist', fn () => view('wishlist'));
Route::get('/checkout', fn () => view('checkout'));
Route::get('/confirmation/{number}', fn (string $n) => view('confirmation', ['number' => $n]));

Route::get('/sitemap.xml', function () {
    $urls = [['/', null, '1.0'], ['/shop', null, '0.9'], ['/brands', null, '0.8'], ['/collections', null, '0.8'],
        ['/rolex', null, '0.8'], ['/super-clone', null, '0.8'], ['/journal', null, '0.6'], ['/contact-us', null, '0.5']];
    foreach (Catalog::data('brands') as $b) $urls[] = ['/brands/' . $b['slug'], null, '0.8'];
    foreach (Catalog::data('collections') as $c) $urls[] = ['/collections/' . $c['slug'], null, '0.7'];
    foreach (Catalog::data('rolexFamilies') as $f) $urls[] = ['/rolex/' . $f['slug'], null, '0.7'];
    foreach (array_keys(Catalog::data('pages')) as $slug) if ($slug !== 'journal') $urls[] = ['/' . $slug, null, '0.4'];
    foreach (Catalog::data('journal') as $a) $urls[] = ['/journal/' . $a['slug'], $a['date'] ?? null, '0.5'];
    foreach (DB::table('Watch')->where('active', 1)->orderBy('brandSlug')->get(['slug', 'updatedAt']) as $w) {
        $urls[] = ['/watches/' . $w->slug, $w->updatedAt ? substr((string) $w->updatedAt, 0, 10) : null, '0.7'];
    }
    $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n" . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
    foreach ($urls as [$path, $mod, $prio]) {
        $xml .= '  <url><loc>' . e(url($path)) . '</loc>' . ($mod ? "<lastmod>{$mod}</lastmod>" : '') . "<priority>{$prio}</priority></url>\n";
    }
    return response($xml . '</urlset>' . "\n", 200, ['Content-Type' => 'application/xml; charset=UTF-8']);
});

Route::get('/robots.txt', function () {
    $body = "User-agent: *\nDisallow: /admin\nDisallow: /api/\nDisallow: /account\nDisallow: /cart\nDisallow: /checkout\nDisallow: /confirmation/\n\nSitemap: " . url('/sitemap.xml') . "\n";
    return response($body, 200, ['Content-Type' => 'text/plain; charset=UTF-8']);
});


/* ---------- Admin console ---------- */

$adminUser = fn () => request()->attributes->get('user');
$noCache = fn ($response) => tap($response, fn ($r) => $r->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate'));

Route::get('/admin/login', function () use ($adminUser, $noCache) {
    $u = $adminUser();
    if ($u && Admin::isStaff($u)) return redirect('/admin/dashboard');
    return $noCache(response()->view('admin-login'));
})->name('admin.login');

Route::get('/admin/logout', function () use ($noCache) {
    $token = request()->cookie('aw_session');
    if ($token) DB::table('Session')->where('token', $token)->delete();
    return $noCache(redirect('/admin/login'))->withCookie(cookie()->forget('aw_session'));
});

Route::get('/admin/{section?}', function (?string $section = null) use ($adminUser, $noCache) {
    $section = $section ?: 'dashboard';
    $u = $adminUser();
    if (!$u) return redirect('/admin/login');
    if (!Admin::isStaff($u)) {
        if ($u->role === 'customer' && !array_key_exists($u->role, Admin::ROLES)) {
            return $noCache(response()->view('admin-login', ['error' => 'This account does not have admin access']));
        }
        return redirect('/admin/login');
    }
    $section = explode('/', $section)[0];
    abort_unless(in_array($section, Admin::SECTIONS, true), 404);
    abort_unless(Admin::can($u, $section), 403);
    return $noCache(response()->view('admin', ['section' => $section, 'admin' => $u, 'sections' => Admin::sections($u)]));
})->where('section', '.*');

Route::fallback(fn () => response()->view('notfound', [], 404));
