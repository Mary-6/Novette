@extends('layout')
@section('title', $collection['name'].' — Novette Watches')
@section('content')
<section class="bg-charcoal page-hero py-14" style="--hero:url('{{ \App\Support\Catalog::cover($watches[0] ?? null) ?? '/images/hero-3-nautilus.jpg' }}')"><div class="container-x"><p class="eyebrow mb-3">{{ $collection['eyebrow'] }}</p><h1 class="heading-display text-4xl font-medium sm:text-5xl">{{ $collection['name'] }}</h1><p class="mt-3 max-w-xl text-sm text-ivory/70">{{ $collection['description'] }}</p></div></section>
<section class="container-x py-12">
  <p class="mb-8 text-sm text-stone">{{ count($watches) }} watches</p>
  <div class="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
    @forelse($watches as $w) @include('watch-card', ['w'=>$w]) @empty
    <p class="col-span-full py-16 text-center text-sm text-stone">Nothing in this collection right now.</p>
    @endforelse
  </div>
</section>
@endsection
