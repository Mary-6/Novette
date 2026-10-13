@extends('layout')
@section('title','Journal — Novette Watches')
@section('content')
<section class="bg-charcoal page-hero py-14" style="--hero:url('/images/hero-6-reverso.jpg')"><div class="container-x"><p class="eyebrow mb-3">Stories & Guides</p><h1 class="heading-display text-4xl font-medium sm:text-5xl">The Journal</h1></div></section>
<section class="container-x grid gap-8 py-14 md:grid-cols-3">
  @foreach($articles as $a)
  <a href="/journal/{{ $a['slug'] }}" class="group border border-graphite p-8 transition hover:border-gold">
    <p class="eyebrow">{{ $a['category'] }}</p>
    <h2 class="heading-display mt-3 text-xl group-hover:text-gold">{{ $a['title'] }}</h2>
    <p class="mt-3 text-sm text-ivory/70">{{ $a['dek'] }}</p>
    <p class="mt-4 text-xs text-stone">{{ $a['readTime'] }} · {{ $a['date'] }}</p>
  </a>
  @endforeach
</section>
@endsection
