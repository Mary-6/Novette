@extends('layout')
@php use App\Support\Catalog; @endphp
@section('title', $w->model.' — Novette Watches')
@section('meta', \Illuminate\Support\Str::limit(strip_tags($w->description ?? ''), 155))
@if(!empty($w->images[0]))@section('ogImage', url($w->images[0]))@endif
@section('content')
<section class="container-x py-10">
  <nav class="mb-8 text-xs uppercase tracking-[0.2em] text-stone">
    <a href="/shop" class="hover:text-gold">Shop</a> / <a href="/brands/{{ $w->brandSlug }}" class="hover:text-gold">{{ Catalog::brandName($w->brandSlug) }}</a> / {{ $w->model }}
  </nav>
  <div class="grid gap-12 lg:grid-cols-2">
    <div>
      <div class="overflow-hidden bg-sand"><img id="gallery-main" src="{{ $w->images[0] ?? '' }}" alt="{{ $w->model }}" class="aspect-square w-full object-cover"></div>
      @if(count($w->images)>1)
      <div class="mt-3 grid grid-cols-5 gap-3">
        @foreach($w->images as $img)
        <button type="button" onclick="document.getElementById('gallery-main').src='{{ $img }}'" class="overflow-hidden bg-sand ring-gold focus:ring-1"><img src="{{ $img }}" class="aspect-square w-full object-cover" alt=""></button>
        @endforeach
      </div>
      @endif
    </div>
    <div>
      <p class="eyebrow mb-3">{{ Catalog::brandName($w->brandSlug) }}</p>
      <h1 class="heading-display text-4xl font-medium">{{ $w->model }}</h1>
      <p class="mt-2 text-sm text-stone">Reference {{ $w->reference }} · {{ $w->year }} · {{ $w->condition }}@if($w->nickname) · "{{ $w->nickname }}"@endif</p>
      <p class="heading-display mt-6 text-3xl">{{ Catalog::price($w->price) }}</p>
      <p class="mt-6 text-sm leading-relaxed text-ivory/80">{{ $w->description }}</p>
      <div class="mt-8 flex gap-3">
        @if($w->available)
        <button type="button" data-add-cart="{{ $w->id }}" class="flex-1 rounded-full bg-gold px-8 py-3.5 text-xs uppercase tracking-[0.2em] text-ink transition hover:bg-goldLight">Add to Cart</button>
        @else
        <p class="text-sm text-stone">This reference has sold — contact the concierge for sourcing.</p>
        @endif
        <button type="button" data-wish="{{ $w->id }}" aria-label="Wishlist" class="rounded-full border border-graphite px-4 transition hover:border-gold hover:text-gold">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
        </button>
      </div>
      <ul class="mt-8 space-y-2 border-t border-graphite pt-6 text-sm text-ivory/70">
        <li>✓ Certified authentic — signed Certificate of Authenticity</li>
        <li>✓ Free insured overnight shipping over $5,000</li>
        <li>✓ Two-year Novette warranty</li>
        <li>✓ 14-day returns, concierge-arranged</li>
      </ul>
      @if($w->specs)
      <h2 class="eyebrow mt-10 mb-4">Specifications</h2>
      <dl class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
        @foreach($w->specs as $k=>$v)
        <div><dt class="text-stone">{{ ucwords(preg_replace('/([a-z])([A-Z])/','$1 $2',$k)) }}</dt><dd class="mt-0.5 text-ivory">{{ $v }}</dd></div>
        @endforeach
      </dl>
      @endif
    </div>
  </div>
  @if(count($related))
  <h2 class="heading-display mt-20 mb-8 text-3xl font-medium">More {{ Catalog::brandName($w->brandSlug) }}</h2>
  <div class="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
    @foreach($related as $r) @include('watch-card', ['w'=>$r]) @endforeach
  </div>
  @endif
</section>
@endsection
