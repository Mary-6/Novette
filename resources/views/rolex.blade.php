@extends('layout')
@php use App\Support\Catalog; @endphp
@section('title','Rolex Watches — Novette Watches')
@section('content')
<section class="bg-charcoal page-hero py-14" style="--hero:url('/images/hero-2-submariner.jpg')"><div class="container-x"><p class="eyebrow mb-3">The Crown</p><h1 class="heading-display text-4xl font-medium sm:text-5xl">Rolex</h1><p class="mt-3 max-w-2xl text-sm text-ivory/70">A crown for every achievement — new and unworn Rolex references, all authenticated and warranted.</p></div></section>
<section class="container-x py-12">
  <div class="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
    @foreach($families as $f)
    <a href="/rolex/{{ $f['slug'] }}" class="border border-graphite p-4 text-center transition hover:border-gold">
      <p class="heading-display text-lg">{{ $f['name'] }}</p><p class="mt-1 line-clamp-2 text-xs text-stone">{{ $f['blurb'] }}</p>
    </a>
    @endforeach
  </div>
  <div class="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
    @foreach($watches as $w) @include('watch-card', ['w'=>$w]) @endforeach
  </div>
</section>
@endsection
