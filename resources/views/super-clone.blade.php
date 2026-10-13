@extends('layout')
@section('title', 'Super Clone Watches — Novette Watches')
@section('meta', 'Unbranded homage-grade Super Clone watches: dive, GMT, chronograph and dress styles from $450 to $600. Clearly labeled replica-style timepieces — not genuine branded watches.')
@section('content')
<section class="bg-charcoal page-hero py-14" style="--hero:url('/images/super-clone/sc-diver-41-black.jpg')">
  <div class="container-x">
    <p class="eyebrow mb-3">The Super Clone Collection</p>
    <h1 class="heading-display text-4xl font-medium sm:text-5xl">Super Clone Watches</h1>
    <p class="mt-3 max-w-xl text-sm text-ivory/70">Homage-grade automatic timepieces built to high finishing standards — solid-link bracelets, sapphire crystals and reliable automatic movements, without the luxury-brand price.</p>
    <p class="mt-4 max-w-xl text-xs leading-relaxed text-ivory/50">Every watch in this collection is an unbranded, replica-style homage piece. These are <span class="text-ivory/80">not</span> genuine products of Rolex, Omega, Panerai, Audemars Piguet, TAG Heuer or any other luxury brand, carry no original trademarks or logos, and are not affiliated with or endorsed by any brand. Genuine, authenticated brand-name watches are in our <a href="/shop" class="text-gold hover:underline">main collection</a>.</p>
  </div>
</section>
<section class="container-x py-12">
  @php $tiers = collect($watches)->pluck('price')->unique()->sort()->values(); @endphp
  <div class="mb-8 flex flex-wrap items-center justify-between gap-3">
    <p class="text-sm text-stone">{{ count($watches) }} watches</p>
    <p class="text-xs uppercase tracking-[0.2em] text-stone">From {{ \App\Support\Catalog::price($tiers->first() ?? 450) }} to {{ \App\Support\Catalog::price($tiers->last() ?? 600) }}</p>
  </div>
  <div class="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
    @forelse($watches as $w) @include('watch-card', ['w'=>$w]) @empty
    <p class="col-span-full py-16 text-center text-sm text-stone">Nothing in this collection right now.</p>
    @endforelse
  </div>
</section>
@endsection
