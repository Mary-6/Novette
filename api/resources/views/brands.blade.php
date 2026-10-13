@extends('layout')
@php use App\Support\Catalog; @endphp
@section('title','Brands — Novette Watches')
@section('content')
<section class="bg-charcoal page-hero py-14" style="--hero:url('/images/hero-4-royal-oak.jpg')"><div class="container-x"><p class="eyebrow mb-3">The Maisons</p><h1 class="heading-display text-4xl font-medium sm:text-5xl">Brands</h1></div></section>
<section class="container-x grid gap-8 py-14 sm:grid-cols-2 lg:grid-cols-3">
  @foreach($brands as $b)
  @php $s=\Illuminate\Support\Facades\DB::table('Watch')->where('active', 1)->where('brandSlug',$b['slug'])->orderByDesc('popularity')->first(); $img=Catalog::cover($s); @endphp
  <a href="/brands/{{ $b['slug'] }}" class="group border border-graphite transition hover:border-gold">
    <div class="aspect-[16/9] overflow-hidden bg-sand">@if($img)<img src="{{ $img }}" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" alt="{{ $b['name'] }}">@endif</div>
    <div class="p-6">
      <p class="heading-display text-2xl group-hover:text-gold">{{ $b['name'] }}</p>
      <p class="mt-1 text-xs uppercase tracking-[0.2em] text-stone">{{ $b['country'] }} · Est. {{ $b['founded'] }}</p>
      <p class="mt-3 text-sm text-ivory/70">{{ $b['tagline'] }}</p>
    </div>
  </a>
  @endforeach
</section>
@endsection
