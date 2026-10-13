@php
$c = \App\Support\Admin::setting('content', [])['contact'] ?? [];
$cc = [
  'email' => \App\Support\Admin::setting('contactEmail', $c['email'] ?? 'novettewatches@gmail.com'),
  'phone' => \App\Support\Admin::setting('supportPhone', $c['phone'] ?? '+1 800 555 0148'),
];
@endphp
@extends('layout')
@section('title','Contact Us — Novette Watches')
@section('content')
<section class="bg-charcoal page-hero py-14" style="--hero:url('/images/hero-reel-poster.jpg')"><div class="container-x"><p class="eyebrow mb-3">Get In Touch</p><h1 class="heading-display text-4xl font-medium sm:text-5xl">Contact Us</h1></div></section>
<section class="container-x grid max-w-4xl gap-12 py-14 lg:grid-cols-2">
  <form id="contact-form" class="space-y-4">
    <input name="name" required placeholder="Your name" class="w-full border border-graphite bg-charcoal px-4 py-3 text-sm outline-none placeholder:text-stone">
    <input name="email" type="email" required placeholder="Email address" class="w-full border border-graphite bg-charcoal px-4 py-3 text-sm outline-none placeholder:text-stone">
    <input name="subject" placeholder="Subject" class="w-full border border-graphite bg-charcoal px-4 py-3 text-sm outline-none placeholder:text-stone">
    <textarea name="message" required rows="6" placeholder="How can we help?" class="w-full border border-graphite bg-charcoal px-4 py-3 text-sm outline-none placeholder:text-stone"></textarea>
    <button class="rounded-full bg-gold px-8 py-3 text-xs uppercase tracking-[0.2em] text-ink">Send Message</button>
    <p id="contact-status" class="text-sm text-gold"></p>
  </form>
  <div class="text-sm text-ivory/70">
    <p class="eyebrow mb-4">Concierge</p>
    <p class="mb-2"><a href="mailto:{{ $cc['email'] }}" class="hover:text-gold">{{ $cc['email'] }}</a></p>
    <p class="mb-6"><a href="tel:{{ preg_replace('/[^+0-9]/','',$cc['phone']) }}" class="hover:text-gold">{{ $cc['phone'] }}</a></p>
    <p class="leading-relaxed">Mon–Sat, 10am–6pm ET. Serving clients across the United States, entirely online — no walk-in showroom yet.</p>
  </div>
</section>
<script>
document.getElementById('contact-form').addEventListener('submit',async(e)=>{e.preventDefault();
const f=e.target;const body=Object.fromEntries(new FormData(f));
try{await NV.api('/contact',{method:'POST',body});document.getElementById('contact-status').textContent='Message sent — we reply within one business day.';f.reset();}
catch(err){document.getElementById('contact-status').textContent=err.message||'Could not send — try again.';}});
</script>
@endsection
