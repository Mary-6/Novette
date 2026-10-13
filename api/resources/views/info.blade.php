@extends('layout')
@section('title', $page['title'].' — Novette Watches')
@section('content')
<section class="bg-charcoal page-hero py-14" style="--hero:url('/images/hero-5-daytona-gold.jpg')"><div class="container-x"><p class="eyebrow mb-3">{{ $page['eyebrow'] ?? 'Novette' }}</p><h1 class="heading-display text-4xl font-medium sm:text-5xl">{{ $page['title'] }}</h1></div></section>
<section class="container-x max-w-3xl py-14">
  @if($slug==='faqs')
    @php $faqs = \App\Support\Catalog::data('faq'); $cat=''; @endphp
    @foreach($faqs as $f)
      @if($f['category']!==$cat) @php $cat=$f['category'] @endphp <h2 class="eyebrow mt-10 mb-4">{{ $cat }}</h2> @endif
      <details class="border-b border-graphite py-4"><summary class="cursor-pointer text-sm font-medium hover:text-gold">{{ $f['q'] }}</summary><p class="mt-3 text-sm leading-relaxed text-ivory/70">{{ $f['a'] }}</p></details>
    @endforeach
  @elseif($slug==='about-us')
    @php $about = \App\Support\Admin::setting('content', [])['about'] ?? null; @endphp
    @if($about)
      <h2 class="heading-display mb-4 text-2xl font-medium">{{ $about['title'] ?? 'About Novette Watches' }}</h2>
      <div class="space-y-4 text-sm leading-relaxed text-ivory/80">@foreach(preg_split('/\n{2,}/', $about['body'] ?? '') as $p)<p>{{ $p }}</p>@endforeach</div>
    @else
    <p class="text-sm leading-relaxed text-ivory/80">For nearly four decades Novette Watches has brought together the world's most legendary watches for collectors who value precision, heritage and lasting value.</p>
    <p class="mt-4 text-sm leading-relaxed text-ivory/80">Every watch undergoes a multi-point inspection by our certified horologists. Serving clients across the United States, entirely online.</p>
    @endif
  @elseif(isset($page['sections']))
    @foreach($page['sections'] as $s)
    <h2 class="heading-display mt-10 mb-3 text-2xl font-medium">{{ $s['heading'] }}</h2>
    <p class="text-sm leading-relaxed text-ivory/70">{{ $s['body'] }}</p>
    @endforeach
  @elseif(isset($page['body']))
    <p class="text-sm leading-relaxed text-ivory/80">{{ $page['body'] }}</p>
  @endif
</section>
@endsection
