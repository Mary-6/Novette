<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Admin — Novette Watches</title>
<link rel="icon" href="/favicon.svg"><link rel="stylesheet" href="/assets/app.css"><link rel="stylesheet" href="/admin.css">
</head>
<body class="min-h-screen bg-ink text-ivory">
<div id="toast-root" class="fixed bottom-6 right-6 z-[100] flex flex-col gap-2"></div>

<!-- Mobile top bar -->
<header class="sticky top-0 z-40 flex items-center justify-between border-b border-graphite bg-ink/95 px-4 py-3 backdrop-blur lg:hidden">
  <div class="flex items-center gap-1">
    <button id="back-btn-m" class="rounded p-2 text-ivory hover:bg-graphite" aria-label="Back" title="Back">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
    </button>
    <button id="nav-burger" class="rounded p-2 text-ivory hover:bg-graphite" aria-label="Menu">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
    </button>
  </div>
  <a href="/admin/dashboard" class="flex items-center gap-2">@php echo App\Support\Catalog::logoSvg('h-8 w-8') @endphp<span class="heading-display text-base">Novette</span></a>
  <a href="/" class="text-xs text-stone hover:text-gold">Site ↗</a>
</header>

<div id="backdrop" class="fixed inset-0 z-40 hidden bg-black/60 lg:hidden"></div>

<div class="flex min-h-screen">
  <!-- Sidebar -->
  <aside id="sidebar" class="fixed inset-y-0 left-0 z-50 flex w-60 -translate-x-full flex-col border-r border-graphite bg-[#131110] transition-transform lg:static lg:translate-x-0">
    <a href="/admin/dashboard" class="flex items-center gap-3 border-b border-graphite px-5 py-5">
      @php echo App\Support\Catalog::logoSvg('h-9 w-9') @endphp
      <div><p class="heading-display text-lg font-medium leading-none">Novette</p><p class="mt-1 text-[10px] uppercase tracking-[0.3em] text-stone">Admin Console</p></div>
    </a>
    <nav id="side-nav" class="flex-1 space-y-0.5 overflow-y-auto p-3"></nav>
    <div class="border-t border-graphite p-3">
      <a href="/admin/logout" class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs uppercase tracking-[0.18em] text-stone transition hover:bg-graphite hover:text-red-400">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/></svg>Logout
      </a>
    </div>
  </aside>

  <!-- Main -->
  <div class="flex min-w-0 flex-1 flex-col">
    <!-- Top nav -->
    <header class="sticky top-0 z-30 hidden items-center justify-between gap-4 border-b border-graphite bg-ink/95 px-8 py-3.5 backdrop-blur lg:flex">
      <div id="crumb" class="flex min-w-0 flex-1 items-center gap-3">
        <button id="back-btn" class="flex shrink-0 items-center gap-1.5 rounded-full border border-graphite px-3.5 py-1.5 text-xs uppercase tracking-[0.14em] text-ivory transition hover:border-gold hover:text-gold" aria-label="Back" title="Back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>Back
        </button>
        <input id="top-search" placeholder="Search orders, products, customers…" class="w-80 rounded-full border border-graphite bg-charcoal px-4 py-1.5 text-xs outline-none placeholder:text-stone focus:border-gold">
      </div>
      <div class="flex items-center gap-2">
        <span class="mr-1 text-xs text-stone">{{ App\Support\Admin::ROLES[$admin->role] ?? $admin->role }}</span>
        <a id="top-chat" href="/admin/chat" class="relative rounded-full p-2 text-stone transition hover:bg-graphite hover:text-ivory" title="Live chat">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span id="badge-chat" class="absolute -right-0.5 -top-0.5 hidden min-w-[16px] rounded-full bg-gold px-1 text-center text-[10px] font-bold leading-4 text-ink"></span>
        </a>
        <button id="top-bell" class="relative rounded-full p-2 text-stone transition hover:bg-graphite hover:text-ivory" title="Notifications">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          <span id="badge-bell" class="absolute -right-0.5 -top-0.5 hidden min-w-[16px] rounded-full bg-gold px-1 text-center text-[10px] font-bold leading-4 text-ink"></span>
        </button>
        <div class="relative">
          <button id="top-user" class="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition hover:bg-graphite">
            @if($admin->avatar)<img src="{{ $admin->avatar }}" class="h-8 w-8 rounded-full object-cover" alt="">
            @else<span class="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-xs font-bold text-ink">{{ strtoupper(mb_substr($admin->name,0,1)) }}</span>@endif
            <span class="max-w-[140px] truncate text-sm">{{ $admin->name }}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          <div id="user-menu" class="absolute right-0 top-full mt-2 hidden w-44 rounded-lg border border-graphite bg-charcoal py-1 shadow-2xl">
            <a href="/admin/settings" class="block px-4 py-2 text-sm hover:bg-graphite">Profile & settings</a>
            <a href="/" class="block px-4 py-2 text-sm hover:bg-graphite">View store ↗</a>
            <a href="/admin/logout" class="block px-4 py-2 text-sm text-red-400 hover:bg-graphite">Logout</a>
          </div>
        </div>
      </div>
    </header>
    <!-- Notifications dropdown -->
    <div id="bell-menu" class="fixed right-6 top-16 z-50 hidden w-96 max-w-[90vw] rounded-xl border border-graphite bg-charcoal shadow-2xl">
      <div class="flex items-center justify-between border-b border-graphite px-5 py-3">
        <p class="eyebrow">Notifications</p>
        <button id="bell-read-all" class="text-xs text-gold hover:underline">Mark all read</button>
      </div>
      <div id="bell-list" class="max-h-96 divide-y divide-graphite overflow-y-auto"></div>
      <a href="/admin/notifications" class="block border-t border-graphite px-5 py-2.5 text-center text-xs uppercase tracking-[0.2em] text-gold hover:bg-graphite">View all</a>
    </div>

    <main id="app" class="flex-1 p-5 sm:p-8">
      <div class="space-y-4">
        <div class="skel h-8 w-48"></div><div class="grid grid-cols-2 gap-4 lg:grid-cols-4"><div class="skel h-28"></div><div class="skel h-28"></div><div class="skel h-28"></div><div class="skel h-28"></div></div><div class="skel h-64"></div>
      </div>
    </main>
  </div>
</div>

<script>
window.ADMIN = {!! json_encode([
    'user' => ['id'=>$admin->id,'name'=>$admin->name,'email'=>$admin->email,'role'=>$admin->role,'roleLabel'=>App\Support\Admin::ROLES[$admin->role]??$admin->role,'avatar'=>$admin->avatar],
    'sections' => array_values($sections),
    'section' => $section,
    'liveChatUrl' => config('services.smartsupp.dashboard_url'),
]) !!};
</script>
<script src="/admin.js"></script>
<script src="/admin-pages-1.js"></script>
<script src="/admin-pages-2.js"></script>
<script src="/admin-pages-3.js"></script>
</body>
</html>
