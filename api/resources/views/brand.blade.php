@extends('layout')
@php use App\Support\Catalog; @endphp
@section('title', $brand['name'].' Watches — Novette Watches')
@section('content')
<section class="bg-charcoal page-hero py-14" style="--hero:url('{{ \App\Support\Catalog::cover($watches[0] ?? null) ?? '/images/hero-4-royal-oak.jpg' }}')">
  <div class="container-x">
    <p class="eyebrow mb-3">{{ $brand['country'] }} · Est. {{ $brand['founded'] }}</p>
    <h1 class="heading-display text-4xl font-medium sm:text-5xl">{{ $brand['name'] }}</h1>
    <p class="mt-3 italic text-gold">{{ $brand['tagline'] }}</p>
    <p class="mt-4 max-w-2xl text-sm leading-relaxed text-ivory/70">{{ $brand['intro'] }}</p>
  </div>
</section>
<section class="container-x py-12">
  <div class="mb-8 flex items-center justify-between">
    <p class="text-sm text-stone">{{ count($watches) }} watches</p>
    <form method="get"><select name="sort" onchange="this.form.submit()" class="border border-graphite bg-charcoal px-3 py-2 text-sm">
      <option value="">Most popular</option><option value="price-asc" @selected(request('sort')==='price-asc')>Price low→high</option><option value="price-desc" @selected(request('sort')==='price-desc')>Price high→low</option><option value="newest" @selected(request('sort')==='newest')>Newest</option>
    </select></form>
  </div>
  <div class="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
    @forelse($watches as $w) @include('watch-card', ['w'=>$w]) @empty
    <p class="col-span-full py-16 text-center text-sm text-stone">No {{ $brand['name'] }} in stock — ask the concierge to source one.</p>
    @endforelse
  </div>
</section>
@endsection
