@extends('layout')
@section('title','Account — Novette Watches')
@section('content')
<section class="bg-charcoal page-hero py-14" style="--hero:url('/images/hero-4-royal-oak.jpg')"><div class="container-x"><p class="eyebrow mb-3">Your Account</p><h1 class="heading-display text-4xl font-medium sm:text-5xl" id="acct-name">Account</h1></div></section>
<section class="container-x py-14" id="acct">
  <div id="acct-root"><p class="text-sm text-stone">Loading…</p></div>
</section>
@endsection
@section('scripts')
<script>
(async()=>{
await NV.ready;
if(!NV.user){location.href='/login?next=/account';return;}
document.getElementById('acct-name').textContent='Hello, '+NV.user.name;
const root=document.getElementById('acct-root');
const orders=await NV.api('/orders').catch(()=>[]);
const fmt=n=>'$'+Number(n).toLocaleString();
root.innerHTML=`<div class="grid gap-8 lg:grid-cols-[220px_1fr]">
<div class="space-y-3 border-r border-graphite pr-8 text-sm">
<p><span class="text-stone">Email</span><br>${NV.user.email}</p>
<p><span class="text-stone">Verified</span><br>${NV.user.emailVerified?'Yes':'Pending — check your inbox'}</p>
<p><span class="text-stone">Role</span><br>${NV.user.role}</p>
<button onclick="NV.logout()" class="mt-4 rounded-full border border-graphite px-6 py-2 text-xs uppercase tracking-widest transition hover:border-gold">Log out</button></div>
<div><h2 class="eyebrow mb-4">Order History</h2>
${orders.length?orders.map(o=>`<div class="mb-4 border border-graphite p-5"><p class="flex justify-between text-sm"><b>${o.number}</b><span class="uppercase text-gold">${o.status}</span></p><p class="mt-1 text-xs text-stone">${(o.items||[]).map(i=>i.model+' ×'+i.qty).join(', ')}</p><p class="mt-1 text-sm">${fmt(o.total)}${o.trackingNumber?' · Tracking '+o.trackingNumber:''}</p></div>`).join(''):'<p class="text-sm text-stone">No orders yet.</p>'}</div></div>`;
})();
</script>
@endsection
