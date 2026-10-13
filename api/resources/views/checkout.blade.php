@extends('layout')
@section('title','Checkout — Novette Watches')
@section('content')
<section class="bg-charcoal page-hero py-14" style="--hero:url('/images/hero-1-speedmaster.jpg')"><div class="container-x"><p class="eyebrow mb-3">Secure Checkout</p><h1 class="heading-display text-4xl font-medium sm:text-5xl">Place Order Request</h1></div></section>
<section class="container-x max-w-3xl py-14">
  <div id="co-root"><p class="text-sm text-stone">Loading…</p></div>
</section>
@endsection
@section('scripts')
<script>
(async()=>{
await NV.ready;
const root=document.getElementById('co-root');
const fmt=n=>'$'+Number(n).toLocaleString();
let items=[];
if(NV.user){items=(await NV.api('/cart').catch(()=>[])).map(i=>({watch:i.watch,qty:i.qty})).filter(i=>i.watch);}
else{const ids=NV.cart.get();const ws=await fetch('/api/watches').then(r=>r.json()).catch(()=>[]);items=ids.map(i=>({watch:ws.find(w=>w.id===i.watchId),qty:i.qty})).filter(i=>i.watch);}
if(!items.length){root.innerHTML='<p class="text-sm text-stone">Your cart is empty.</p>';return;}
const rates=await fetch('/api/shipping-rates').then(r=>r.json()).catch(()=>[]);
const sub=items.reduce((s,i)=>s+i.watch.price*i.qty,0);
root.innerHTML=`<form id="co-form" class="space-y-8">
<div><p class="eyebrow mb-4">1 · Contact</p><div class="grid gap-4 sm:grid-cols-2">
<input name="customerName" required placeholder="Full name" class="border border-graphite bg-charcoal px-4 py-3 text-sm outline-none">
<input name="email" type="email" required placeholder="Email" class="border border-graphite bg-charcoal px-4 py-3 text-sm outline-none"></div></div>
<div><p class="eyebrow mb-4">2 · Shipping Address</p><div class="grid gap-4 sm:grid-cols-2">
<input name="address" required placeholder="Street address" class="border border-graphite bg-charcoal px-4 py-3 text-sm outline-none sm:col-span-2">
<input name="city" required placeholder="City" class="border border-graphite bg-charcoal px-4 py-3 text-sm outline-none">
<input name="zip" required placeholder="ZIP" class="border border-graphite bg-charcoal px-4 py-3 text-sm outline-none">
<input name="country" required value="United States" class="border border-graphite bg-charcoal px-4 py-3 text-sm outline-none"></div></div>
<div><p class="eyebrow mb-4">3 · Delivery</p><div class="space-y-3">
${rates.map(r=>`<label class="flex items-center justify-between border border-graphite px-5 py-4 text-sm"><span><input type="radio" name="shippingMethod" value="${r.id}" class="mr-3 accent-[#C9A24C]" ${r.id==='courier'?'checked':''}>${r.label} <span class="text-stone">· ${r.hint}</span></span><b>${r.price?fmt(r.price):'Free'}</b></label>`).join('')}
</div></div>
<div class="border border-graphite p-6">
${items.map(i=>`<p class="flex justify-between py-1 text-sm"><span>${i.watch.model} ×${i.qty}</span><span>${fmt(i.watch.price*i.qty)}</span></p>`).join('')}
<p class="mt-3 flex justify-between border-t border-graphite pt-3 text-sm"><span>Subtotal</span><b>${fmt(sub)}</b></p>
<p class="mt-2 text-xs text-stone">No payment is taken online — a concierge contacts you personally to confirm and complete the order.</p></div>
<button class="w-full rounded-full bg-gold py-3.5 text-xs uppercase tracking-[0.2em] text-ink">Place Order</button>
<p id="co-err" class="text-sm text-red-400"></p></form>`;
document.getElementById('co-form').addEventListener('submit',async(e)=>{e.preventDefault();
const f=new FormData(e.target);
const body={email:f.get('email'),customerName:f.get('customerName'),shippingMethod:f.get('shippingMethod'),
address:{address:f.get('address'),city:f.get('city'),zip:f.get('zip'),country:f.get('country')},
items:items.map(i=>({watchId:i.watch.id,qty:i.qty}))};
try{const r=await NV.api('/orders',{method:'POST',body});
if(!NV.user){NV.cart.set([]);}
location.href='/confirmation/'+r.order.number;}
catch(err){document.getElementById('co-err').textContent=err.message||'Could not place order.';}});
})();
</script>
@endsection
