@php
use App\Support\Catalog;
use App\Support\Admin;
$cc = array_replace(['phone' => '+1 800 555 0148', 'email' => 'novettewatches@gmail.com', 'address' => '', 'hours' => 'Mon–Sat, 10am–6pm ET'], Admin::setting('content', [])['contact'] ?? []);
$cc['phone'] = Admin::setting('supportPhone', $cc['phone']);
$cc['email'] = Admin::setting('contactEmail', $cc['email']);
$socials = array_filter(Admin::setting('socials', []) ?: []);
$brands = Catalog::data('brands');
$collections = Catalog::data('collections');
$gaId = Admin::setting('gaMeasurementId');
$gscCode = Admin::setting('searchConsoleCode');
$resources = [
    ['Journal','/journal'], ['Buying Guide','/buying-guide'], ['Authenticity Pledge','/authenticity-pledge'],
    ["Buyer's Protection Plan",'/buyers-protection-plan'], ['Watch Care','/watch-care'], ['FAQ','/faqs'],
];
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>@yield('title', 'Novette Watches — New & Unworn Luxury Watches')</title>
<meta name="description" content="@yield('meta', 'New and unworn luxury watches, authenticated and warranted by Novette Watches.')">
<link rel="canonical" href="{{ url()->current() }}">
<meta property="og:site_name" content="Novette Watches">
<meta property="og:type" content="website">
<meta property="og:title" content="@yield('title', 'Novette Watches — New & Unworn Luxury Watches')">
<meta property="og:description" content="@yield('meta', 'New and unworn luxury watches, authenticated and warranted by Novette Watches.')">
<meta property="og:url" content="{{ url()->current() }}">
<meta property="og:image" content="@yield('ogImage', url('/images/hero-1-speedmaster.jpg'))">
@if($gscCode)<meta name="google-site-verification" content="{{ $gscCode }}">@endif
<link rel="icon" href="/favicon.svg">
<link rel="stylesheet" href="/assets/app.css">
@if($gaId)
<script async src="https://www.googletagmanager.com/gtag/js?id={{ $gaId }}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',@json($gaId));</script>
@endif
</head>
<body class="bg-ink text-ivory antialiased">

<header class="sticky top-0 z-50 bg-ink text-ivory">
  <div class="border-b border-graphite bg-charcoal">
    <div class="container-x flex h-8 items-center justify-between text-[10px] uppercase tracking-[0.22em] text-ivory/60">
      <p class="truncate">Trusted by 5,000+ Clients · Free Overnight Shipping · 100% Certified Authentic</p>
      <nav class="hidden items-center gap-5 sm:flex">
        <a href="/contact-us" class="transition hover:text-gold">Contact Us</a>
        <span id="auth-links" class="contents"></span>
      </nav>
    </div>
  </div>
  <div class="container-x flex h-16 items-center gap-6">
    <button class="lg:hidden" onclick="document.getElementById('drawer').classList.remove('hidden')" aria-label="Open menu" type="button">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
    </button>
    <span class="flex items-center gap-2.5">{!! Catalog::logoSvg('h-9 w-9') !!}<span class="text-sm uppercase tracking-[0.24em]">Novette <span class="text-gold">Watches</span></span></span>
    <nav id="mainnav" class="hidden items-center gap-7 lg:flex">
      <a href="/" class="text-xs uppercase tracking-[0.18em] transition hover:text-gold">Home</a>
      <a href="/super-clone" class="text-xs uppercase tracking-[0.18em] transition hover:text-gold">Super Clone</a>
      <div class="nav-item relative">
        <button type="button" data-menu="watches" class="nav-toggle text-xs uppercase tracking-[0.18em] transition hover:text-gold flex items-center gap-1">Luxury Watches
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></button>
        <div data-panel="watches" class="nav-panel absolute left-0 top-full z-50 mt-4 w-[560px] bg-charcoal p-6 shadow-2xl transition invisible opacity-0">
          <div class="grid grid-cols-2 gap-6">
            <div>
              <p class="eyebrow mb-3">Brands</p>
              <div class="grid grid-cols-2 gap-x-4 gap-y-2">
                @foreach($brands as $b)
                <a href="/brands/{{ $b['slug'] }}" class="text-sm text-ivory/80 transition hover:text-gold">{{ $b['name'] }}</a>
                @endforeach
              </div>
            </div>
            <div>
              <p class="eyebrow mb-3">Collections</p>
              <div class="flex flex-col gap-2">
                @foreach($collections as $c)
                <a href="/collections/{{ $c['slug'] }}" class="text-sm text-ivory/80 transition hover:text-gold">{{ $c['name'] }}</a>
                @endforeach
              </div>
            </div>
          </div>
        </div>
      </div>
      <a href="/shop?sort=newest" class="text-xs uppercase tracking-[0.18em] transition hover:text-gold">New Arrivals</a>
      <div class="nav-item relative">
        <button type="button" data-menu="resources" class="nav-toggle text-xs uppercase tracking-[0.18em] transition hover:text-gold flex items-center gap-1">Resources
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></button>
        <div data-panel="resources" class="nav-panel absolute left-0 top-full z-50 mt-4 w-56 bg-charcoal p-5 shadow-2xl transition invisible opacity-0">
          <div class="flex flex-col gap-3">
            @foreach($resources as [$label,$to])
            <a href="{{ $to }}" class="text-sm text-ivory/80 transition hover:text-gold">{{ $label }}</a>
            @endforeach
          </div>
        </div>
      </div>
    </nav>
    <div class="ml-auto hidden w-56 lg:block">
      <form action="/shop" method="get" class="flex items-center gap-2 rounded-full border border-graphite bg-charcoal px-4 py-2">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shrink-0 text-stone"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
        <input name="q" placeholder="Search by brand or model" class="w-full min-w-0 bg-transparent text-sm text-ivory outline-none placeholder:text-stone">
      </form>
    </div>
    <div class="flex items-center gap-4">
      <a href="/wishlist" aria-label="Wishlist" class="relative transition hover:text-gold">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
        <span id="wish-count" class="absolute -right-2 -top-2 hidden h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] font-semibold text-ink"></span>
      </a>
      <a href="/cart" aria-label="Cart" class="relative transition hover:text-gold">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        <span id="cart-count" class="absolute -right-2 -top-2 hidden h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] font-semibold text-ink"></span>
      </a>
    </div>
  </div>
  <div id="drawer" class="fixed inset-0 z-50 hidden lg:hidden">
    <div class="absolute inset-0 bg-ink/70" onclick="document.getElementById('drawer').classList.add('hidden')"></div>
    <div class="absolute left-0 top-0 h-full w-80 max-w-[85vw] overflow-y-auto bg-charcoal p-6">
      <div class="mb-6 flex items-center justify-between">
        <span class="flex items-center gap-2">{!! Catalog::logoSvg('h-7 w-7') !!}<span class="text-xs uppercase tracking-[0.24em]">Novette</span></span>
        <button onclick="document.getElementById('drawer').classList.add('hidden')" aria-label="Close menu" type="button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <form action="/shop" method="get" class="mb-6 flex items-center gap-2 rounded-full border border-graphite px-4 py-2">
        <input name="q" placeholder="Search by brand or model" class="w-full bg-transparent text-sm outline-none placeholder:text-stone">
      </form>
      <div class="flex flex-col gap-3 text-sm uppercase tracking-[0.2em]">
        <a href="/">Home</a>
        <a href="/super-clone">Super Clone</a>
        <div class="nav-item relative">
          <button type="button" data-menu="m-watches" class="nav-toggle flex items-center gap-1 uppercase tracking-[0.2em]">Luxury Watches
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></button>
          <div data-panel="m-watches" class="nav-panel invisible absolute left-0 top-full z-[60] mt-2 w-56 bg-ink p-4 normal-case tracking-normal opacity-0 shadow-2xl ring-1 ring-graphite transition">
            <div class="flex flex-col gap-2.5 text-sm">
              <a href="/shop" class="text-ivory/80 transition hover:text-gold">All Watches</a>
              <a href="/brands" class="text-ivory/80 transition hover:text-gold">Brands</a>
              <a href="/collections" class="text-ivory/80 transition hover:text-gold">Collections</a>
            </div>
          </div>
        </div>
        <a href="/shop?sort=newest">New Arrivals</a>
        <div class="nav-item relative">
          <button type="button" data-menu="m-resources" class="nav-toggle flex items-center gap-1 uppercase tracking-[0.2em]">Resources
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></button>
          <div data-panel="m-resources" class="nav-panel invisible absolute left-0 top-full z-[60] mt-2 w-56 bg-ink p-4 normal-case tracking-normal opacity-0 shadow-2xl ring-1 ring-graphite transition">
            <div class="flex flex-col gap-2.5 text-sm">
              @foreach($resources as [$label,$to])
              <a href="{{ $to }}" class="text-ivory/80 transition hover:text-gold">{{ $label }}</a>
              @endforeach
            </div>
          </div>
        </div>
        <a href="/wishlist">Wishlist</a>
        <a href="/cart">Cart</a>
        <a href="/contact-us">Contact Us</a>
        <a href="/account">Account</a>
      </div>
    </div>
  </div>
</header>

<main>@yield('content')</main>

<footer class="bg-ink text-ivory">
  <div class="container-x py-16">
    <div class="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
      @foreach([
        ['About', [['About Us','/about-us'],['Trust & Compliance','/trust-and-compliance'],['Journal','/journal'],['Press','/journal']]],
        ['Buying', [['Why Buy From Us','/why-buy-from-us'],['Authenticity Pledge','/authenticity-pledge'],["Buyer's Protection Plan",'/buyers-protection-plan'],['Reviews','/#reviews']]],
        ['Support', [['FAQ','/faqs'],['U.S. Shipping','/shipping-info'],['International Shipping','/international-shipping'],['Returns','/return-policy'],['Warranty','/warranty'],['Contact Us','/contact-us']]],
      ] as [$title,$links])
      <div>
        <p class="eyebrow mb-4">{{ $title }}</p>
        <ul class="space-y-2.5 text-sm text-ivory/70">
          @foreach($links as [$label,$to])
          <li><a href="{{ $to }}" class="transition hover:text-gold">{{ $label }}</a></li>
          @endforeach
        </ul>
      </div>
      @endforeach
      <div>
        <p class="eyebrow mb-4">Need Help?</p>
        <ul class="space-y-3 text-sm text-ivory/70">
          <li><a id="support-phone" href="tel:{{ preg_replace('/[^+0-9]/','',$cc['phone']) }}" class="transition hover:text-gold">{{ $cc['phone'] }}</a></li>
          <li><a href="mailto:{{ $cc['email'] }}" class="transition hover:text-gold">{{ $cc['email'] }}</a></li>
          @if($cc['address'])<li class="text-ivory/50">{{ $cc['address'] }}</li>@endif
          <li class="text-ivory/50">{{ $cc['hours'] }}</li>
        </ul>
        @if($socials)
        <div class="mt-4 flex gap-4 text-[10px] uppercase tracking-[0.2em] text-ivory/50">
          @foreach($socials as $net => $url)
          <a href="{{ $url }}" target="_blank" rel="noopener" class="transition hover:text-gold">{{ $net === 'x' ? 'X' : ucfirst($net) }}</a>
          @endforeach
        </div>
        @endif
        <p class="eyebrow mb-3 mt-8">Newsletter</p>
        <form id="newsletter-form" class="flex border border-graphite">
          <input type="email" required placeholder="Email address" class="w-full bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-stone">
          <button type="submit" class="bg-gold px-4 text-xs uppercase tracking-widest text-ink">Join</button>
        </form>
        <p id="newsletter-done" class="hidden text-sm text-gold">Thank you, you are on the list.</p>
      </div>
      <div>
        <span class="flex items-center gap-2.5">{!! Catalog::logoSvg('h-10 w-10') !!}<span class="text-sm uppercase tracking-[0.24em]">Novette <span class="text-gold">Watches</span></span></span>
        <p class="mt-1 text-[10px] uppercase tracking-[0.3em] text-ivory/50">Fine Timepieces · Est. 1987</p>
        <p class="mt-5 text-sm leading-relaxed text-ivory/60">Serving clients across the United States, entirely online. New and unworn luxury watches, authenticated and warranted for two years.</p>
      </div>
    </div>
    <div class="mt-14 flex flex-col items-center justify-between gap-4 border-t border-graphite pt-8 text-xs text-ivory/40 sm:flex-row">
      <p>© {{ date('Y') }} Novette Watches Ltd. All rights reserved.</p>
      <nav class="flex gap-6">
        <a href="/privacy-policy" class="transition hover:text-gold">Privacy</a>
        <a href="/terms-and-conditions" class="transition hover:text-gold">Terms</a>
        <a href="/sitemap" class="transition hover:text-gold">Sitemap</a>
        <a href="/accessibility" class="transition hover:text-gold">Accessibility</a>
      </nav>
    </div>
  </div>
</footer>

<script src="/app.js"></script>
@if(config('services.smartsupp.key'))
<script>
var _smartsupp = _smartsupp || {};
_smartsupp.key = @json(config('services.smartsupp.key'));
window.smartsupp || (function(d){var s,c,o=smartsupp=function(){o._.push(arguments)};o._=[];
s=d.getElementsByTagName('script')[0];c=d.createElement('script');
c.type='text/javascript';c.charset='utf-8';c.async=true;
c.src='https://www.smartsuppchat.com/loader.js?';s.parentNode.insertBefore(c,s);})(document);
</script>
@endif
@yield('scripts')
</body>
</html>
