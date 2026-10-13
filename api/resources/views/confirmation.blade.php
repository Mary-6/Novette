@extends('layout')
@section('title','Order Confirmed — Novette Watches')
@section('content')
<section class="page-bg" style="--hero:url('/images/hero-3-nautilus.jpg')"><div class="container-x flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
  <p class="eyebrow mb-3">Thank You</p>
  <h1 class="heading-display text-4xl font-medium sm:text-5xl">Order Request Confirmed</h1>
  <p class="mt-4 max-w-md text-sm text-ivory/70">Order <b class="text-gold">{{ $number }}</b> is in the vault queue. A concierge will contact you personally to complete the order — no payment was taken online.</p>
  <div class="mt-8 flex gap-4">
    <a href="/shop" class="rounded-full border border-ivory/50 px-8 py-3 text-xs uppercase tracking-[0.2em] transition hover:bg-ivory hover:text-ink">Continue Shopping</a>
    <a href="/account" class="rounded-full border border-ivory/50 px-8 py-3 text-xs uppercase tracking-[0.2em] transition hover:bg-ivory hover:text-ink">View Orders</a>
  </div>
</div></section>
@endsection
