@extends('layout')
@section('title','Account — Novette Watches')
@section('content')
<section class="page-bg" style="--hero:url('/images/hero-5-daytona-gold.jpg')"><div class="container-x flex min-h-[60vh] items-center justify-center py-16">
  <div class="w-full max-w-md border border-graphite bg-charcoal p-10">
    @if($mode==='login')
      <p class="eyebrow mb-3">Welcome Back</p>
      <h1 class="heading-display mb-8 text-3xl font-medium">Login</h1>
      <form id="login-form" class="space-y-4">
        <input name="email" type="email" required placeholder="Email" class="w-full border border-graphite bg-ink px-4 py-3 text-sm outline-none placeholder:text-stone">
        <div class="relative">
          <input id="pw" name="password" type="password" required placeholder="Password" class="w-full border border-graphite bg-ink px-4 py-3 pr-11 text-sm outline-none placeholder:text-stone">
          <button type="button" onclick="const p=document.getElementById('pw');p.type=p.type==='password'?'text':'password'" class="absolute right-3 top-1/2 -translate-y-1/2 text-stone hover:text-gold" aria-label="Show password">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
        <label class="flex items-center gap-2 text-xs text-ivory/70"><input type="checkbox" name="remember" checked class="accent-[#C9A24C]"> Remember me</label>
        <button class="w-full rounded-full bg-gold py-3 text-xs uppercase tracking-[0.2em] text-ink">Login</button>
        <p id="login-err" class="text-sm text-red-400"></p>
      </form>
      <p class="mt-6 flex justify-between text-xs text-stone"><a href="/forgot-password" class="hover:text-gold">Forgot password?</a><a href="/signup" class="hover:text-gold">Create account</a></p>
      <script>
      document.getElementById('login-form').addEventListener('submit',async(e)=>{e.preventDefault();
      const f=new FormData(e.target);
      try{const r=await NV.login(f.get('email'),f.get('password'),!!f.get('remember'));
        const next=new URLSearchParams(location.search).get('next');
        location.href=r.role==='admin'?'/admin':(next==='chat'?'/?chat=1':(next||'/account'));}
      catch(err){document.getElementById('login-err').textContent=err.message||'Sign in failed';}});
      </script>
    @elseif($mode==='signup')
      <p class="eyebrow mb-3">Join Novette</p>
      <h1 class="heading-display mb-8 text-3xl font-medium">Create Account</h1>
      <form id="signup-form" class="space-y-4">
        <input name="name" required placeholder="Full name" class="w-full border border-graphite bg-ink px-4 py-3 text-sm outline-none placeholder:text-stone">
        <input name="email" type="email" required placeholder="Email" class="w-full border border-graphite bg-ink px-4 py-3 text-sm outline-none placeholder:text-stone">
        <input name="password" type="password" required minlength="8" placeholder="Password (8+ characters)" class="w-full border border-graphite bg-ink px-4 py-3 text-sm outline-none placeholder:text-stone">
        <label class="flex items-center gap-2 text-xs text-ivory/70"><input type="checkbox" name="remember" checked class="accent-[#C9A24C]"> Remember me</label>
        <button class="w-full rounded-full bg-gold py-3 text-xs uppercase tracking-[0.2em] text-ink">Create Account</button>
        <p id="signup-err" class="text-sm text-red-400"></p>
      </form>
      <p class="mt-6 text-xs text-stone">Have an account? <a href="/login" class="hover:text-gold">Sign in</a></p>
      <script>
      document.getElementById('signup-form').addEventListener('submit',async(e)=>{e.preventDefault();
      const f=new FormData(e.target);
      try{await NV.signup(f.get('name'),f.get('email'),f.get('password'),!!f.get('remember'));location.href='/account';}
      catch(err){document.getElementById('signup-err').textContent=err.message||'Sign up failed';}});
      </script>
    @elseif($mode==='forgot')
      <p class="eyebrow mb-3">Password Help</p>
      <h1 class="heading-display mb-8 text-3xl font-medium">Reset Password</h1>
      <form id="forgot-form" class="space-y-4">
        <input name="email" type="email" required placeholder="Email" class="w-full border border-graphite bg-ink px-4 py-3 text-sm outline-none placeholder:text-stone">
        <button class="w-full rounded-full bg-gold py-3 text-xs uppercase tracking-[0.2em] text-ink">Send Reset Link</button>
        <p id="forgot-msg" class="text-sm text-gold"></p>
      </form>
      <p class="mt-6 text-xs text-stone"><a href="/login" class="hover:text-gold">Back to sign in</a></p>
      <script>
      document.getElementById('forgot-form').addEventListener('submit',async(e)=>{e.preventDefault();
      await NV.api('/auth/forgot-password',{method:'POST',body:{email:new FormData(e.target).get('email')}}).catch(()=>{});
      document.getElementById('forgot-msg').textContent='If that email exists, a reset link is on its way.';});
      </script>
    @elseif($mode==='reset')
      <p class="eyebrow mb-3">Password Help</p>
      <h1 class="heading-display mb-8 text-3xl font-medium">New Password</h1>
      <form id="reset-form" class="space-y-4">
        <input name="password" type="password" required minlength="8" placeholder="New password" class="w-full border border-graphite bg-ink px-4 py-3 text-sm outline-none placeholder:text-stone">
        <button class="w-full rounded-full bg-gold py-3 text-xs uppercase tracking-[0.2em] text-ink">Update Password</button>
        <p id="reset-msg" class="text-sm"></p>
      </form>
      <script>
      document.getElementById('reset-form').addEventListener('submit',async(e)=>{e.preventDefault();
      const m=document.getElementById('reset-msg');
      try{await NV.api('/auth/reset-password',{method:'POST',body:{token:new URLSearchParams(location.search).get('token'),password:new FormData(e.target).get('password')}});
      m.className='text-sm text-gold';m.textContent='Password updated — sign in.';setTimeout(()=>location.href='/login',1200);}
      catch(err){m.className='text-sm text-red-400';m.textContent=err.message;}});
      </script>
    @elseif($mode==='verify')
      <p class="eyebrow mb-3">Account</p>
      <h1 class="heading-display mb-4 text-3xl font-medium">Email Verification</h1>
      <p id="verify-msg" class="text-sm text-ivory/70">Verifying…</p>
      <script>
      (async()=>{const m=document.getElementById('verify-msg');
      try{await NV.api('/auth/verify-email',{method:'POST',body:{token:new URLSearchParams(location.search).get('token')}});
      m.className='text-sm text-gold';m.textContent='Email verified — welcome to Novette.';}
      catch(err){m.textContent=err.message||'Link invalid or expired.';}})();
      </script>
    @endif
  </div>
</div></section>
@endsection
