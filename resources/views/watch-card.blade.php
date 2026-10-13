@php use App\Support\Catalog; @endphp
<a href="/watches/{{ $w->slug }}" class="group block">
  <div class="relative overflow-hidden bg-sand">
    @if($w->image)<img src="{{ $w->image }}" alt="{{ $w->model }}" loading="lazy" class="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105">@endif
    @if($w->isNew)<span class="absolute left-3 top-3 bg-ink px-2 py-1 text-[9px] uppercase tracking-[0.2em] text-gold">New</span>@endif
    <button type="button" data-wish="{{ $w->id }}" aria-label="Wishlist" class="absolute right-3 top-3 rounded-full bg-ink/60 p-2 text-ivory transition hover:text-gold" onclick="event.preventDefault()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
    </button>
  </div>
  <p class="eyebrow mt-4">{{ Catalog::brandName($w->brandSlug) }}</p>
  <p class="heading-display mt-1 text-lg leading-snug group-hover:text-goldDark">{{ $w->model }}</p>
  <p class="mt-1 text-xs text-stone">Ref. {{ $w->reference }} · {{ $w->year }} · {{ $w->condition }}</p>
  <p class="mt-2 text-sm font-medium">{{ Catalog::price($w->price) }}</p>
</a>
