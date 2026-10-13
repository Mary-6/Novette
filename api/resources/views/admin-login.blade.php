<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Admin Login — Novette Watches</title>
<link rel="icon" href="/favicon.svg"><link rel="stylesheet" href="/assets/app.css">
</head>
<body class="flex min-h-screen items-center justify-center bg-ink text-ivory" style="background-image:radial-gradient(1100px 500px at 50% -10%,rgba(201,162,76,.09),transparent 60%)">
<div class="w-full max-w-sm px-4">
  <div class="mb-8 text-center">
    <a href="/" class="inline-block">@php echo App\Support\Catalog::logoSvg('mx-auto h-14 w-14') @endphp</a>
    <p class="heading-display mt-4 text-2xl font-medium">Novette Admin</p>
    <p class="eyebrow mt-2">Restricted Access</p>
  </div>
  @if(isset($error))
  <p class="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">{{ $error }}</p>
  @endif
  <form id="gate-form" class="space-y-4 border border-graphite bg-charcoal/80 p-8 shadow-2xl">
    <div>
      <label class="eyebrow mb-1 block" for="gate-email">Email</label>
      <input id="gate-email" name="email" type="email" autocomplete="username" required autofocus placeholder="admin@novettewatches.com" class="w-full border border-graphite bg-ink px-4 py-3 text-sm outline-none placeholder:text-stone">
      <p class="mt-1 hidden text-xs text-red-400" data-err="email"></p>
    </div>
    <div>
      <label class="eyebrow mb-1 block" for="gate-password">Password</label>
      <div class="relative">
        <input id="gate-password" name="password" type="password" autocomplete="current-password" required placeholder="••••••••" class="w-full border border-graphite bg-ink px-4 py-3 pr-11 text-sm outline-none placeholder:text-stone">
        <button type="button" id="gate-eye" class="absolute right-3 top-1/2 -translate-y-1/2 text-stone transition hover:text-gold" aria-label="Show password">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </div>
      <p class="mt-1 hidden text-xs text-red-400" data-err="password"></p>
    </div>
    <label class="flex items-center gap-2 text-xs text-ivory/70"><input type="checkbox" id="gate-remember" checked class="accent-[#C9A24C]"> Remember me</label>
    <button id="gate-btn" class="flex w-full items-center justify-center gap-2 rounded-full bg-gold py-3 text-xs font-semibold uppercase tracking-[0.25em] text-ink transition disabled:opacity-60">
      <span id="gate-spin" class="hidden h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink"></span>Login
    </button>
    <p id="gate-err" class="text-center text-sm text-red-400"></p>
  </form>
  <p class="mt-6 text-center text-xs text-stone"><a href="/" class="transition hover:text-gold">← Back to storefront</a></p>
</div>
<script>
const f=document.getElementById('gate-form'),btn=document.getElementById('gate-btn'),spin=document.getElementById('gate-spin');
document.getElementById('gate-eye').addEventListener('click',()=>{const p=document.getElementById('gate-password');p.type=p.type==='password'?'text':'password';});
f.addEventListener('submit',async(e)=>{
  e.preventDefault();document.getElementById('gate-err').textContent='';
  document.querySelectorAll('[data-err]').forEach(el=>el.classList.add('hidden'));
  const email=document.getElementById('gate-email').value.trim(),pw=document.getElementById('gate-password').value;
  let bad=false;
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){showErr('email','Enter a valid email');bad=true;}
  if(!pw){showErr('password','Password is required');bad=true;}
  if(bad)return;
  btn.disabled=true;spin.classList.remove('hidden');
  try{
    const r=await fetch('/api/admin/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',
      body:JSON.stringify({email,password:pw,remember:document.getElementById('gate-remember').checked})});
    const j=await r.json().catch(()=>({}));
    if(!r.ok){
      if(j.errors)for(const[k,msgs]of Object.entries(j.errors))showErr(k,msgs[0]);
      document.getElementById('gate-err').textContent=j.error||'Login failed — check your credentials';
      btn.disabled=false;spin.classList.add('hidden');return;
    }
    location.href=j.redirect||'/admin/dashboard';
  }catch{document.getElementById('gate-err').textContent='Network error — try again';btn.disabled=false;spin.classList.add('hidden');}
});
function showErr(k,m){const el=document.querySelector(`[data-err="${k}"]`);if(el){el.textContent=m;el.classList.remove('hidden');}}
</script>
</body>
</html>
