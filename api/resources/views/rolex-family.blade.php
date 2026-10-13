@extends('layout')
@section('title','Rolex '.$family['name'].' — Novette Watches')
@section('content')
<section class="bg-charcoal page-hero py-14" style="--hero:url('{{ \App\Support\Catalog::cover($watches[0] ?? null) ?? '/images/hero-2-submariner.jpg' }}')"><div class="container-x"><p class="eyebrow mb-3">Rolex</p><h1 class="heading-display text-4xl font-medium sm:text-5xl">{{ $family['name'] }}</h1><p class="mt-3 max-w-2xl text-sm text-ivory/70">{{ $family['blurb'] }}</p></div></section>
<section class="container-x py-12">
  <div class="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
    @forelse($watches as $w) @include('watch-card', ['w'=>$w]) @empty
    <p class="col-span-full py-16 text-center text-sm text-stone">No {{ $family['name'] }} references in stock — <a href="/rolex" class="text-gold">see all {{ $all }} Rolex</a>.</p>
    @endforelse
  </div>
</section>
@endsection
