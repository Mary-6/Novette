import { existsSync, readdirSync, rmSync, renameSync } from 'node:fs';
import { writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import watches from '../src/data/watches.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public', 'images', 'watches');

const norm = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const BRAND_ALIASES = {
  'jaeger-lecoultre': ['jaeger lecoultre', 'jlc'],
  'vacheron-constantin': ['vacheron constantin'],
  'patek-philippe': ['patek philippe'],
  'grand-seiko': ['grand seiko'],
  'tag-heuer': ['tag heuer', 'tagheuer'],
  'richard-mille': ['richard mille'],
};
const brandAlias = (slug, brandName) => BRAND_ALIASES[slug] || [norm(brandName)];

// Family keywords: for short/collision-prone families map to required phrase(s).
const FAMILY_KEYWORDS = {
  'oyster perpetual': ['oyster perpetual'],
  'cosmograph daytona': ['daytona', 'cosmograph'],
  daytona: ['daytona', 'cosmograph'],
  submariner: ['submariner'],
  datejust: ['datejust'],
  'lady-datejust': ['datejust'],
  'day-date': ['day date', 'daydate'],
  'gmt-master ii': ['gmt'],
  'gmt-master': ['gmt'],
  'explorer ii': ['explorer'],
  explorer: ['explorer'],
  'yacht-master': ['yacht master', 'yachtmaster'],
  'sea-dweller': ['sea dweller', 'seadweller'],
  'sky-dweller': ['sky dweller', 'skydweller'],
  'air-king': ['air king', 'airking'],
  milgauss: ['milgauss'],
  nautilus: ['nautilus'],
  aquanaut: ['aquanaut'],
  calatrava: ['calatrava'],
  'twenty~4': ['twenty 4', 'twenty4', 'twenty~4'],
  'royal oak offshore': ['royal oak'],
  'royal oak': ['royal oak'],
  'royal oak concept': ['royal oak'],
  'code 11.59': ['code 11 59', 'code1159', 'code 1159'],
  'royal oak jumbo': ['royal oak'],
  speedmaster: ['speedmaster'],
  seamaster: ['seamaster'],
  constellation: ['constellation'],
  'de ville': ['de ville', 'deville'],
  santos: ['santos'],
  tank: ['tank'],
  panthere: ['panthere', 'panthere de cartier'],
  'ballon bleu': ['ballon bleu'],
  navitimer: ['navitimer'],
  superocean: ['superocean'],
  chronomat: ['chronomat'],
  premier: ['premier'],
  carrera: ['carrera'],
  monaco: ['monaco'],
  aquaracer: ['aquaracer'],
  'black bay': ['black bay'],
  'black bay 58': ['black bay'],
  'black bay gmt': ['black bay'],
  pelagos: ['pelagos'],
  'prince oysterdate': ['oysterdate', 'prince'],
  'big bang': ['big bang'],
  'spirit of big bang': ['big bang'],
  'classic fusion': ['classic fusion'],
  portugieser: ['portugieser', 'portuguese'],
  portofino: ['portofino'],
  'pilots watch': ['pilot'],
  'pilots mark': ['pilot', 'mark'],
  luminor: ['luminor'],
  radiomir: ['radiomir'],
  submersible: ['submersible', 'luminor'],
  reverso: ['reverso'],
  'master ultra thin': ['master ultra thin', 'master control'],
  polaris: ['polaris'],
  'overseas self-winding': ['overseas'],
  overseas: ['overseas'],
  'historiques 222': ['222', 'historiques'],
  patrimony: ['patrimony'],
  fiftysix: ['fiftysix', 'fifty six'],
  'spring drive': ['grand seiko'],
};

const refToken = (ref) => {
  const t = norm(ref).replace(/ /g, '');
  return t.length >= 5 ? t : null;
};

const modelPhrase = (model) => {
  // remove quoted nicknames and pure case-size numbers
  let m = model.replace(/"[^"]*"/g, '');
  m = m
    .split(/\s+/)
    .filter((w) => !/^\d+([.,]\d+)?(mm)?$/i.test(w))
    .join(' ');
  m = norm(m);
  return m.length >= 4 ? m : null;
};

const credits = JSON.parse(await readFile(path.join(ROOT, 'src/data/imageCredits.json'), 'utf8'));
const { default: images } = await import('../src/data/watchImages.js');

let kept = 0;
let deleted = 0;
const withPhotos = [];
const rows = [];

for (const w of watches) {
  const slug = w.slug;
  const dir = path.join(OUT, slug);
  const creds = credits[slug] || [];
  if (!creds.length) continue;

  const brandWords = brandAlias(w.brandSlug, w.brandSlug.replace(/-/g, ' '));
  const fam = norm(w.family || '');
  const famKeys = FAMILY_KEYWORDS[fam] || (fam ? [fam] : []);
  const ref = refToken(w.reference || '');
  const model = modelPhrase(w.model || '');

  const accept = (title) => {
    const t = norm(title);
    // brand alias check (AP special: standalone uppercase AP in original)
    let brandOk = brandWords.some((a) => t.includes(a));
    if (!brandOk && w.brandSlug === 'audemars-piguet' && /\bAP\b/.test(title)) brandOk = true;
    if (!brandOk) return false;
    if (ref && t.replace(/ /g, '').includes(ref)) return true;
    if (famKeys.some((k) => t.includes(k))) return true;
    if (model && t.includes(model)) return true;
    return false;
  };

  const keptIdx = [];
  const delIdx = [];
  creds.forEach((c, i) => (accept(c.title) ? keptIdx : delIdx).push(i));

  // delete files, renumber survivors
  const files = existsSync(dir)
    ? readdirSync(dir)
        .filter((f) => f.endsWith('.jpg'))
        .sort((a, b) => parseInt(a) - parseInt(b))
    : [];
  const keepSet = new Set(keptIdx.map((i) => `${i + 1}.jpg`));
  for (const f of files) {
    if (!keepSet.has(f)) {
      rmSync(path.join(dir, f));
      deleted++;
    }
  }
  const remaining = readdirSync(dir)
    .filter((f) => f.endsWith('.jpg'))
    .sort((a, b) => parseInt(a) - parseInt(b));
  remaining.forEach((f, i) => {
    if (f !== `${i + 1}.jpg`) renameSync(path.join(dir, f), path.join(dir, `${i + 1}.jpg`));
  });

  if (remaining.length) {
    credits[slug] = keptIdx.map((i, n) => ({ ...creds[i], file: `${n + 1}.jpg` }));
    images[slug] = remaining.map((_, i) => `/images/watches/${slug}/${i + 1}.jpg`);
    withPhotos.push(`${slug} (${remaining.length})`);
    kept += remaining.length;
  } else {
    delete credits[slug];
    delete images[slug];
  }
  rows.push(`${slug}: kept ${remaining.length}, dropped ${delIdx.length}`);
}

await writeFile(
  path.join(ROOT, 'src/data/watchImages.js'),
  `export default ${JSON.stringify(images, null, 2)};\n`.replace(/"/g, "'")
);
await writeFile(path.join(ROOT, 'src/data/imageCredits.json'), JSON.stringify(credits, null, 2));

console.log(rows.join('\n'));
console.log(
  `\nkept ${kept} photos, deleted ${deleted}; watches with real photos: ${withPhotos.length}`
);
console.log(withPhotos.join(', '));
