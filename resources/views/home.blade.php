@extends('layout')
@php use App\Support\Catalog; @endphp
@section('title', 'Novette Watches — New & Unworn Luxury Watches')
@section('content')
<section class="relative isolate flex items-end overflow-hidden bg-ink text-ivory" style="min-height:max(520px,calc(100svh - 6rem))">
  @foreach(($heroImgs ?? []) ?: ['hero-1-speedmaster','hero-2-submariner','hero-3-nautilus','hero-4-royal-oak','hero-5-daytona-gold','hero-6-reverso'] as $i => $h)
  <img src="{{ str_starts_with($h,'/') ? $h : '/images/'.$h.'.jpg' }}" alt="" aria-hidden="true" class="hero-still absolute inset-x-0 top-0 -z-10 h-[68%] w-full object-cover object-center transition-opacity duration-[1500ms] sm:h-full {{ $i===0?'opacity-100':'opacity-0' }}">
  @endforeach
  <video id="hero-video" class="absolute inset-x-0 top-0 -z-10 h-[68%] w-full object-cover object-center opacity-0 transition-opacity duration-1000 sm:h-full" src="/images/hero-reel.mp4" poster="/images/hero-reel-poster.jpg" autoplay muted loop playsinline preload="auto" aria-hidden="true" onplaying="this.classList.replace('opacity-0','opacity-100')"></video>
  <div class="absolute inset-0 -z-10 bg-gradient-to-t from-ink from-30% via-ink/70 via-55% to-transparent sm:from-ink/90 sm:from-0% sm:via-ink/40 sm:via-50% sm:to-ink/10"></div>
  <div class="container-x relative flex w-full flex-col items-center pb-14 pt-40 text-center sm:pb-14">
    <p class="eyebrow mb-4">New &amp; Unworn Luxury Watches</p>
    <h1 class="heading-display max-w-4xl text-5xl font-medium leading-[1.05] sm:text-5xl lg:text-6xl xl:whitespace-nowrap">{{ $hero['title'] }} <span class="italic text-gold">{{ $hero['highlight'] }}</span></h1>
    <p class="mt-5 max-w-[560px] text-base leading-relaxed text-ivory/85">{{ $hero['subtitle'] }}</p>
    <div class="mt-8 flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:justify-center">
      <a href="{{ $hero['ctaLink'] }}" class="rounded-full border border-ivory/50 px-8 py-3 text-xs uppercase tracking-[0.2em] text-ivory transition hover:bg-ivory hover:text-ink">{{ $hero['ctaLabel'] }}</a>
      <a href="/rolex" class="rounded-full border border-ivory/50 px-8 py-3 text-xs uppercase tracking-[0.2em] text-ivory transition hover:bg-ivory hover:text-ink">Explore Rolex</a>
    </div>
  </div>
</section>
<script>
let heroIdx=0;const stills=document.querySelectorAll('.hero-still');
setInterval(()=>{if(!document.hidden){stills[heroIdx].classList.replace('opacity-100','opacity-0');heroIdx=(heroIdx+1)%stills.length;stills[heroIdx].classList.replace('opacity-0','opacity-100');}},5000);
</script>

<section class="py-20 lg:py-28">
  <div class="container-x grid items-center gap-12 lg:grid-cols-2">
    <div>
      <p class="eyebrow mb-3">The Novette Standard</p>
      <h2 class="heading-display text-3xl font-medium sm:text-4xl lg:text-5xl">Where Heritage Meets Modern Elegance</h2>
      <div class="mt-6 space-y-4 text-sm leading-relaxed text-graphite">
        <p>For nearly four decades Novette Watches has brought together the world's most legendary watches for collectors who value precision, heritage and lasting value, each reference chosen for the story it will carry onto the next wrist.</p>
        <p>Every watch undergoes a multi-point inspection by our certified horologists: serial numbers, movement and provenance verified against our records before listing. One hundred percent certified authentic, always.</p>
      </div>
      <ul class="mt-8 space-y-3">
        @foreach(['Inspected, timed and verified in-house','Free insured overnight delivery','Access to rare, waitlist-only references','Two-year warranty beyond manufacturer terms'] as $p)
        <li class="flex items-start gap-3 text-sm text-graphite"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A24C" stroke-width="2" class="mt-0.5 shrink-0"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg>{{ $p }}</li>
        @endforeach
      </ul>
    </div>
    <div class="border border-gold/60 p-2">
      <img src="/images/watches/rolex-daytona-two-tone-116503/visualization-lifestyle.jpg" alt="Rolex Cosmograph Daytona two-tone" loading="lazy" class="aspect-[4/5] w-full object-cover">
    </div>
  </div>
</section>

<section class="border-b border-stone/25 bg-white py-10 text-ink">
  <div class="container-x">
    <p class="eyebrow mb-6 text-center">Fifteen Maisons</p>
    <div class="-mx-4 flex gap-8 overflow-x-auto px-4 pb-4">
      @foreach($brands as $b)
      @php $sample = $featured->firstWhere('brandSlug',$b['slug']) ?: \Illuminate\Support\Facades\DB::table('Watch')->where('brandSlug',$b['slug'])->first(); $si = Catalog::cover($sample); @endphp
      <a href="/brands/{{ $b['slug'] }}" class="group flex w-24 shrink-0 flex-col items-center gap-2 text-center">
        <div class="h-16 w-16 overflow-hidden rounded-full bg-sand">@if($si)<img src="{{ $si }}" class="h-full w-full object-cover" alt="{{ $b['name'] }}">@endif</div>
        <span class="text-[10px] uppercase tracking-[0.15em] text-graphite transition group-hover:text-goldDark">{{ $b['name'] }}</span>
      </a>
      @endforeach
    </div>
  </div>
</section>

<section class="bg-white py-20 text-ink lg:py-28">
  <div class="container-x">
    <div class="mb-10 flex items-end justify-between">
      <div><p class="eyebrow mb-3">The Crown</p><h2 class="heading-display text-3xl font-medium sm:text-4xl lg:text-5xl">Shop Rolex Watches</h2></div>
      <a href="/rolex" class="rounded-full border border-stone px-6 py-2.5 text-xs uppercase tracking-[0.2em] transition hover:border-gold hover:text-goldDark">View All Models</a>
    </div>
    <div class="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
      @foreach(array_slice($rolexFamilies,0,6) as $f)
      @php
        $fn = fn($s)=>preg_replace('/[^a-z0-9]/','',strtolower($s??''));
        $rep = $featured->first(fn($w)=>str_contains($fn($w->model),$fn(str_replace('-',' ',$f['slug']))));
        if(!$rep) $rep = \Illuminate\Support\Facades\DB::table('Watch')->where('brandSlug','rolex')->get()->first(fn($w)=>str_contains($fn($w->model),$fn(str_replace('-',' ',$f['slug']))));
        $ri = Catalog::cover($rep, 1);
      @endphp
      <a href="/rolex/{{ $f['slug'] }}" class="group block text-center">
        <div class="overflow-hidden bg-sand">@if($ri)<img src="{{ $ri }}" class="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105" alt="{{ $f['name'] }}">@endif</div>
        <p class="heading-display mt-4 text-lg group-hover:text-goldDark">{{ $f['name'] }}</p>
      </a>
      @endforeach
    </div>
  </div>
</section>

@if(!empty($promo['enabled']))
<section class="border-y border-gold/40 bg-charcoal py-14 text-ivory">
  <div class="container-x flex flex-col items-center gap-4 text-center">
    <p class="eyebrow">{{ $promo['eyebrow'] }}</p>
    <h2 class="heading-display max-w-2xl text-3xl font-medium sm:text-4xl">{{ $promo['title'] }}</h2>
    @if(!empty($promo['text']))<p class="max-w-xl text-sm text-ivory/75">{{ $promo['text'] }}</p>@endif
    <a href="{{ $promo['ctaLink'] ?: '/shop' }}" class="mt-2 rounded-full border border-gold px-8 py-3 text-xs uppercase tracking-[0.2em] text-gold transition hover:bg-gold hover:text-ink">{{ $promo['ctaLabel'] ?: 'Shop Now' }}</a>
  </div>
</section>
@endif

<section class="bg-sand py-20 text-ink lg:py-28">
  <div class="container-x">
    <div class="mb-10 flex items-end justify-between">
      <div><p class="eyebrow mb-3">Just Landed</p><h2 class="heading-display text-3xl font-medium sm:text-4xl lg:text-5xl">New Arrivals</h2></div>
      <a href="/shop?sort=newest" class="rounded-full border border-stone px-6 py-2.5 text-xs uppercase tracking-[0.2em] transition hover:border-gold hover:text-goldDark">Shop New Arrivals</a>
    </div>
    <div class="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
      @foreach($newest as $w)
      @include('watch-card', ['w' => $w])
      @endforeach
    </div>
  </div>
</section>

<section class="bg-white py-20 text-ink lg:py-28">
  <div class="container-x">
    <div class="mb-10"><p class="eyebrow mb-3">Featured</p><h2 class="heading-display text-3xl font-medium sm:text-4xl lg:text-5xl">The Edit</h2></div>
    <div class="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
      @foreach($featured as $w)
      @include('watch-card', ['w' => $w])
      @endforeach
    </div>
  </div>
</section>

<section class="bg-ink py-20 text-ivory lg:py-28" id="reviews">
  <div class="container-x">
    <p class="eyebrow mb-3 text-center">Client Reviews</p>
    <h2 class="heading-display mb-12 text-center text-3xl font-medium sm:text-4xl">Trusted by Collectors</h2>
    <div class="grid gap-8 md:grid-cols-3">
      @foreach(array_slice($reviews,0,3) as $r)
      <figure class="border border-graphite p-8">
        @php $rt = round(((float) $r['rating']) * 2) / 2; @endphp
        <div class="mb-4 flex items-center gap-1 text-gold" aria-label="{{ $rt }} out of 5 stars">
          @for($i=1;$i<=5;$i++)
            @if($rt >= $i)<span>★</span>@elseif($rt >= $i - 0.5)<span class="star-half">★</span>@else<span class="text-graphite">★</span>@endif
          @endfor
          <span class="ml-2 text-xs text-stone">{{ rtrim(rtrim(number_format($rt, 1), '0'), '.') }}</span>
        </div>
        <blockquote class="text-sm leading-relaxed text-ivory/80">"{{ $r['text'] }}"</blockquote>
        <figcaption class="mt-5 text-xs uppercase tracking-[0.2em] text-stone">{{ $r['name'] }}@if($r['location']) · {{ $r['location'] }}@endif</figcaption>
      </figure>
      @endforeach
    </div>
  </div>
</section>

<section class="bg-white py-20 text-ink lg:py-28">
  <div class="container-x">
    <div class="mb-10 flex items-end justify-between">
      <div><p class="eyebrow mb-3">The Journal</p><h2 class="heading-display text-3xl font-medium sm:text-4xl">Stories &amp; Guides</h2></div>
      <a href="/journal" class="rounded-full border border-stone px-6 py-2.5 text-xs uppercase tracking-[0.2em] transition hover:border-gold hover:text-goldDark">All Articles</a>
    </div>
    <div class="grid gap-8 md:grid-cols-3">
      @foreach(array_slice($articles,0,3) as $a)
      <a href="/journal/{{ $a['slug'] }}" class="group border border-stone/30 p-8 transition hover:border-gold">
        <p class="eyebrow">{{ $a['category'] }}</p>
        <h3 class="heading-display mt-3 text-xl group-hover:text-goldDark">{{ $a['title'] }}</h3>
        <p class="mt-3 text-sm text-graphite">{{ $a['dek'] }}</p>
        <p class="mt-4 text-xs text-stone">{{ $a['readTime'] }} · {{ $a['date'] }}</p>
      </a>
      @endforeach
    </div>
  </div>
</section>
@endsection
