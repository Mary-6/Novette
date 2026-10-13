@extends('layout')
@section('title','Cart — Novette Watches')
@section('content')
<section class="bg-charcoal page-hero py-14" style="--hero:url('/images/hero-2-submariner.jpg')"><div class="container-x"><p class="eyebrow mb-3">Your Selection</p><h1 class="heading-display text-4xl font-medium sm:text-5xl">Cart</h1></div></section>
<section class="container-x py-14">
  <div id="cart-root"><p class="text-sm text-stone">Loading…</p></div>
</section>
@endsection
@section('scripts')
<script>
(async()=>{
await NV.ready;
const root=document.getElementById('cart-root');
const fmt=n=>'$'+Number(n).toLocaleString();
let items=[];
if(NV.user){items=await NV.api('/cart').catch(()=>[]);items=items.map(i=>({watch:i.watch,qty:i.qty})).filter(i=>i.watch);}
else{const ids=NV.cart.get();items=await Promise.all(ids.map(async i=>({watch:await fetch('/api/watches').then(r=>r.json()).then(ws=>ws.find(w=>w.id===i.watchId)),qty:i.qty})));items=items.filter(i=>i.watch);}
if(!items.length){root.innerHTML='<p class="text-sm text-stone">Your cart is empty — <a href="/shop" class="text-gold">browse the collection</a>.</p>';return;}
const total=items.reduce((s,i)=>s+i.watch.price*i.qty,0);
root.innerHTML=`<div class="grid gap-10 lg:grid-cols-[1fr_320px]"><div class="divide-y divide-graphite">
${items.map(i=>`<div class="flex gap-5 py-5"><img src="${(i.watch.images&&i.watch.images[0])||''}" class="h-24 w-24 bg-sand object-cover"><div class="flex-1"><p class="text-sm font-medium">${i.watch.model}</p><p class="text-xs text-stone">Ref. ${i.watch.reference} · Qty ${i.qty}</p><button class="mt-1 text-xs text-stone underline" data-rm="${i.watch.id}">Remove</button></div><p class="text-sm font-medium">${fmt(i.watch.price)}</p></div>`).join('')}
</div><div class="h-fit border border-graphite p-6"><p class="flex justify-between text-sm"><span>Subtotal</span><b>${fmt(total)}</b></p><p class="mt-2 text-xs text-stone">Free insured courier over $5,000. A concierge confirms every order personally.</p><a href="/checkout" class="mt-6 block rounded-full bg-gold py-3 text-center text-xs uppercase tracking-[0.2em] text-ink">Checkout</a></div></div>`;
root.addEventListener('click',e=>{const b=e.target.closest('[data-rm]');if(!b)return;
if(NV.user){fetch('/api/cart').then(r=>r.json()).then(c=>NV.api('/cart',{method:'PUT',body:{items:c.filter(i=>i.watchId!==b.dataset.rm).map(i=>({watchId:i.watchId,qty:i.qty}))}})).then(()=>location.reload());}
else{NV.cart.set(NV.cart.get().filter(i=>i.watchId!==b.dataset.rm));location.reload();}});
})();
</script>
@endsection
