@extends('layout')
@section('title','Wishlist — Novette Watches')
@section('content')
<section class="bg-charcoal page-hero py-14" style="--hero:url('/images/hero-6-reverso.jpg')"><div class="container-x"><p class="eyebrow mb-3">Saved</p><h1 class="heading-display text-4xl font-medium sm:text-5xl">Wishlist</h1></div></section>
<section class="container-x py-14">
  <div id="wl-root" class="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4"><p class="text-sm text-stone">Loading…</p></div>
</section>
@endsection
@section('scripts')
<script>
(async()=>{
await NV.ready;
const root=document.getElementById('wl-root');
let ids=[];
if(NV.user){ids=(await NV.api('/wishlist').catch(()=>[])).map(i=>i.watchId);}else{ids=NV.wishlist.get();}
const ws=await fetch('/api/watches').then(r=>r.json()).catch(()=>[]);
const mine=ws.filter(w=>ids.includes(w.id));
if(!mine.length){root.innerHTML='<p class="col-span-full text-sm text-stone">Nothing saved yet — tap the heart on any watch.</p>';return;}
const fmt=n=>'$'+Number(n).toLocaleString();
root.innerHTML=mine.map(w=>`<div class="group"><a href="/watches/${w.slug}" class="block"><div class="overflow-hidden bg-sand"><img src="${(w.images&&w.images[0])||''}" class="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105"></div><p class="eyebrow mt-4">${w.brandSlug}</p><p class="heading-display mt-1 text-lg">${w.model}</p><p class="mt-2 text-sm">${fmt(w.price)}</p></a><button class="mt-2 text-xs text-stone underline hover:text-gold" data-rm="${w.id}">Remove</button></div>`).join('');
root.addEventListener('click',async e=>{const b=e.target.closest('[data-rm]');if(!b)return;
if(NV.user){const items=await NV.api('/wishlist').catch(()=>[]);await NV.api('/wishlist',{method:'PUT',body:{watchIds:items.map(i=>i.watchId).filter(x=>x!==b.dataset.rm)}}).catch(()=>{});}
else NV.wishlist.set(NV.wishlist.get().filter(x=>x!==b.dataset.rm));
location.reload();});
})();
</script>
@endsection
