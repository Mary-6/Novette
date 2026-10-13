@extends('layout')
@php use App\Support\Catalog; $q=request(); @endphp
@section('title','Shop Luxury Watches — Novette Watches')
@section('content')
<section class="bg-charcoal page-hero py-14" style="--hero:url('/images/hero-1-speedmaster.jpg')">
  <div class="container-x">
    <p class="eyebrow mb-3">The Collection</p>
    <h1 class="heading-display text-4xl font-medium sm:text-5xl">Shop Watches</h1>
    <p class="mt-3 max-w-xl text-sm text-ivory/70">{{ count($watches) }} timepieces, every one authenticated and warranted.</p>
  </div>
</section>
<section class="container-x py-10">
  <form method="get" action="/shop" class="mb-8 flex flex-wrap items-center gap-3">
    <input name="q" value="{{ $q->q }}" placeholder="Search" class="border border-graphite bg-charcoal px-4 py-2 text-sm outline-none placeholder:text-stone">
    <select name="brand" class="border border-graphite bg-charcoal px-3 py-2 text-sm"><option value="">All brands</option>
      @foreach($brands as $b)<option value="{{ $b['slug'] }}" @selected($q->brand===$b['slug'])>{{ $b['name'] }}</option>@endforeach
    </select>
    <select name="gender" class="border border-graphite bg-charcoal px-3 py-2 text-sm"><option value="">Any gender</option><option @selected($q->gender==='Men')>Men</option><option @selected($q->gender==='Women')>Women</option><option @selected($q->gender==='Unisex')>Unisex</option></select>
    <select name="condition" class="border border-graphite bg-charcoal px-3 py-2 text-sm"><option value="">Any condition</option><option @selected($q->condition==='New')>New</option><option @selected($q->condition==='Unworn')>Unworn</option></select>
    <select name="sort" class="border border-graphite bg-charcoal px-3 py-2 text-sm">
      <option value="popular" @selected(($q->sort??'')==='popular')>Most popular</option>
      <option value="price-asc" @selected($q->sort==='price-asc')>Price low to high</option>
      <option value="price-desc" @selected($q->sort==='price-desc')>Price high to low</option>
      <option value="newest" @selected($q->sort==='newest')>Newest</option>
    </select>
    <button class="bg-gold px-5 py-2 text-xs uppercase tracking-widest text-ink">Filter</button>
  </form>
  <div class="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
    @forelse($watches as $w) @include('watch-card', ['w'=>$w]) @empty
    <p class="col-span-full py-16 text-center text-sm text-stone">No watches match those filters.</p>
    @endforelse
  </div>
</section>
@endsection
