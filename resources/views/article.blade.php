@extends('layout')
@section('title', $a['title'].' — Novette Watches')
@section('content')
<section class="bg-charcoal page-hero py-14" style="--hero:url('/images/hero-3-nautilus.jpg')"><div class="container-x"><p class="eyebrow mb-3">{{ $a['category'] }}</p><h1 class="heading-display max-w-3xl text-4xl font-medium">{{ $a['title'] }}</h1><p class="mt-3 text-xs text-stone">{{ $a['readTime'] }} · {{ $a['date'] }}</p></div></section>
<section class="container-x max-w-3xl space-y-6 py-14">
  @foreach($a['body'] as $p)<p class="text-sm leading-relaxed text-ivory/80">{{ $p }}</p>@endforeach
</section>
@endsection
