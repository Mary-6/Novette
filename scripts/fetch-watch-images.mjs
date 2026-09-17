import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import watches from '../src/data/watches.js';

const BRAND_NAMES = {
  rolex: 'Rolex',
  'patek-philippe': 'Patek Philippe',
  'audemars-piguet': 'Audemars Piguet',
  'richard-mille': 'Richard Mille',
  omega: 'Omega',
  cartier: 'Cartier',
  breitling: 'Breitling',
  'tag-heuer': 'TAG Heuer',
  tudor: 'Tudor',
  hublot: 'Hublot',
  iwc: 'IWC',
  panerai: 'Panerai',
  'jaeger-lecoultre': 'Jaeger-LeCoultre',
  'vacheron-constantin': 'Vacheron Constantin',
  'grand-seiko': 'Grand Seiko',
};

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public', 'images', 'watches');
const UA = 'SterlingMeridian/1.0 (dev; contact concierge@sterlingmeridian.com)';
const API = 'https://commons.wikimedia.org/w/api.php';
const OK_LICENSE =
  /^(Public domain|CC0|CC BY( |-)SA?|CC BY-SA|CC BY)(?!.*(NC|ND|Non-free|Fair use))/i;
const BAD_LICENSE = /(NC|ND|Non-free|Fair use|noncommercial)/i;
const BAD_NAME =
  /logo|drawing|\.svg|diagram|advert|poster|\bbox\b|ad_|ad-|sketch|stamp|coin|map\b|boutique|store|shop|building|facade|sign\b|statue|bust\b|clock|tower|boat|yacht|sail|aircraft|plane|jet\b|airshow|car\b|racing|race\b|horse|nebula|cluster|galaxy|chart|graph|painting|portrait|bag\b|document|patent|receipt|directory|window|stained/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const brandName = (slug) => BRAND_NAMES[slug] || slug;

async function search(query) {
  const u = new URL(API);
  u.search = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: `${query} filetype:bitmap`,
    gsrnamespace: '6',
    gsrlimit: '30',
    prop: 'imageinfo',
    iiprop: 'url|extmetadata|size',
    iiurlwidth: '1200',
    format: 'json',
  });
  const res = await fetch(u, { headers: { 'User-Agent': UA } });
  if (!res.ok) return [];
  const data = await res.json();
  const pages = Object.values(data.query?.pages || {});
  return pages
    .map((p) => {
      const ii = p.imageinfo?.[0] || {};
      const meta = ii.extmetadata || {};
      return {
        title: p.title,
        thumb: ii.thumburl,
        url: ii.url,
        descUrl: ii.descriptionurl,
        width: ii.width,
        height: ii.height,
        license: (meta.LicenseShortName?.value || '').replace(/<[^>]*>/g, ''),
        licenseUrl: meta.LicenseUrl?.value || '',
        author: (meta.Artist?.value || '').replace(/<[^>]*>/g, '').trim(),
        credit: (meta.Credit?.value || '').replace(/<[^>]*>/g, '').trim(),
      };
    })
    .filter((x) => {
      if (!x.thumb || !x.license) return false;
      if (!OK_LICENSE.test(x.license) || BAD_LICENSE.test(x.license)) return false;
      if (x.width < 600 || x.height < 600) return false;
      if (BAD_NAME.test(x.title)) return false;
      return true;
    });
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
  return buf.length;
}

const usedTitles = new Set();
const watchImages = {};
const credits = {};
const summary = [];
const brandPool = new Map();

// Pass 1: collect candidates per watch across the query ladder.
const candidates = [];
for (const w of watches) {
  const brand = brandName(w.brandSlug);
  const queries = [
    `"${brand}" "${w.model}" "${w.reference}"`,
    `"${brand}" "${w.model}"`,
    `"${brand}" "${w.family}"`,
    `${brand} ${w.family}`,
    `${w.model} ${w.reference} watch`,
  ];
  const brandRe = new RegExp(brand.split(' ')[0], 'i');
  const topicWords = `${w.model} ${w.family}`
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2);
  const onTopic = (title) =>
    brandRe.test(title) && topicWords.some((t) => title.toLowerCase().includes(t));
  const hits = [];
  const seen = new Set();
  const usedQueries = [];
  for (const q of queries) {
    if (hits.length >= 8) break;
    const results = await search(q);
    usedQueries.push(q);
    for (const r of results) {
      if (!seen.has(r.title) && onTopic(r.title)) {
        seen.add(r.title);
        hits.push(r);
      }
    }
    await sleep(150);
  }
  if (!brandPool.has(w.brandSlug)) brandPool.set(w.brandSlug, []);
  for (const h of hits) brandPool.get(w.brandSlug).push(h);
  candidates.push({ w, hits, usedQueries });
}

// Pass 2: assign up to 4 distinct files per watch, deduped globally first-come.
for (const { w, hits, usedQueries } of candidates) {
  const picked = [];
  for (const h of hits) {
    if (picked.length >= 4) break;
    if (usedTitles.has(h.title)) continue;
    picked.push(h);
    usedTitles.add(h.title);
  }
  // pad from brand pool (already-used titles allowed only if pool exhausted)
  if (picked.length < 4) {
    const pool = brandPool.get(w.brandSlug) || [];
    for (const h of pool) {
      if (picked.length >= 4) break;
      if (!usedTitles.has(h.title)) {
        picked.push(h);
        usedTitles.add(h.title);
      }
    }
    if (picked.length < 4) {
      for (const h of pool) {
        if (picked.length >= 4) break;
        if (!picked.some((p) => p.title === h.title)) picked.push(h);
      }
    }
  }
  candidates.find((c) => c.w === w).picked = picked;
  summary.push({
    slug: w.slug,
    count: picked.length,
    queries: usedQueries.slice(0, 3).join(' + '),
  });
}

// Pass 3: download and write data files.
for (const { w, picked } of candidates) {
  if (!picked?.length) continue;
  const dir = path.join(OUT, w.slug);
  await mkdir(dir, { recursive: true });
  const imgs = [];
  const creds = [];
  for (let i = 0; i < picked.length; i++) {
    const h = picked[i];
    const file = `${i + 1}.jpg`;
    try {
      await download(h.thumb, path.join(dir, file));
      imgs.push(`/images/watches/${w.slug}/${file}`);
      creds.push({
        file,
        title: h.title,
        pageUrl: h.descUrl,
        author: h.author || 'Unknown',
        license: h.license,
        licenseUrl: h.licenseUrl,
      });
    } catch (e) {
      console.log(`FAIL ${w.slug} ${h.title}: ${e.message}`);
    }
    await sleep(200);
  }
  if (imgs.length) {
    watchImages[w.slug] = imgs;
    credits[w.slug] = creds;
  }
}

await writeFile(
  path.join(ROOT, 'src', 'data', 'watchImages.js'),
  `export default ${JSON.stringify(watchImages, null, 2)};\n`
);
await writeFile(
  path.join(ROOT, 'src', 'data', 'imageCredits.json'),
  JSON.stringify(credits, null, 2)
);

console.log('\nslug | count | queries');
console.log('-'.repeat(80));
let full = 0,
  partial = 0,
  none = 0;
for (const s of summary) {
  if (s.count >= 4) full++;
  else if (s.count > 0) partial++;
  else none++;
  console.log(`${s.slug} | ${s.count} | ${s.queries}`);
}
console.log('-'.repeat(80));
console.log(`total ${summary.length} watches: ${full} with 4, ${partial} padded, ${none} fallback`);
