@extends('layout')
@section('title','Collections — Novette Watches')
@section('content')
<section class="bg-charcoal page-hero py-14" style="--hero:url('/images/hero-3-nautilus.jpg')"><div class="container-x"><p class="eyebrow mb-3">Curated Edits</p><h1 class="heading-display text-4xl font-medium sm:text-5xl">Collections</h1></div></section>
<section class="container-x grid gap-8 py-14 sm:grid-cols-2 lg:grid-cols-3">
  @foreach($collections as $c)
  <a href="/collections/{{ $c['slug'] }}" class="group border border-graphite p-8 transition hover:border-gold">
    <p class="eyebrow">{{ $c['eyebrow'] }}</p>
    <p class="heading-display mt-2 text-2xl group-hover:text-gold">{{ $c['name'] }}</p>
    <p class="mt-3 text-sm text-ivory/70">{{ $c['description'] }}</p>
  </a>
  @endforeach
</section>
@endsection
