import { existsSync, readdirSync, rmSync, renameSync } from 'node:fs';
import { writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public', 'images', 'watches');

const SPEC = `
audemars-piguet-code-1159-15: 3
audemars-piguet-royal-oak-of: 3,4
breitling-chronomat-b01-42: 4
breitling-premier-b09-pistac: 1,2,3
breitling-superocean-heritag: 3
cartier-panthere-wgpn0007: 1,2
cartier-santos-dumont-vintag: 4
cartier-santos-wssa0018: 1,3,4
grand-seiko-sbga415-taisetsu: 1
grand-seiko-sbgm221-gmt: 4
grand-seiko-snowflake-sbga21: 3
hublot-big-bang-king-gold-30: 1,3,4
hublot-big-bang-unico-441: 1,2,4
hublot-classic-fusion-511: all
hublot-spirit-of-big-bang-60: all
iwc-pilots-mark-xx-328201: 2,3,4
iwc-portofino-iw356502: 1,3,4
iwc-portugieser-automatic-50: 2,3,4
iwc-portugieser-chronograph-: 4
jaeger-lecoultre-polaris-906: 4
jaeger-lecoultre-reverso-cla: 1,3
jaeger-lecoultre-reverso-tri: 1
omega-constellation-13110292: all
omega-speedmaster-moonwatch-: 2
panerai-luminor-due-pam01249: 2,3,4
panerai-radiomir-vintage-pam: 1
panerai-submersible-pam00959: 3,4
patek-philippe-aquanaut-5167: 2,4
patek-philippe-twenty-4-4910: 1,3,4
richard-mille-rm-011-felipe-: 3,4
richard-mille-rm-035-rafael-: 3,4
richard-mille-rm-055-bubba-w: 4
richard-mille-rm-67-02-sprin: 3,4
rolex-air-king-126900: 2,3,4
rolex-datejust-41-126300: 3
rolex-day-date-36-128235: 3,4
rolex-day-date-40-228238: 2,3
rolex-daytona-116500ln: 2
rolex-daytona-two-tone-11650: 2,3
rolex-explorer-36-124270: 3,4
rolex-explorer-ii-226570: 1
rolex-gmt-master-ii-batman-1: 3
rolex-lady-datejust-28-27917: 1,2
rolex-milgauss-116400gv: 4
rolex-oyster-perpetual-41-12: 3
rolex-sea-dweller-126600: 2
rolex-sky-dweller-326934: 4
rolex-submariner-5513-vintag: 3,4
rolex-submariner-date-126610: 4
rolex-yacht-master-40-126622: 2,4
tag-heuer-carrera-date-wbn23: 2
tudor-black-bay-58-79030n: 4
tudor-black-bay-gmt-79830rb: all
tudor-pelagos-39-25407n: 3,4
tudor-prince-oysterdate-vint: all
vacheron-constantin-fiftysix: 2,3,4
vacheron-constantin-historiq: 3,4
vacheron-constantin-overseas: all
vacheron-constantin-patrimon: 2,3,4
`;

const dirs = existsSync(OUT) ? readdirSync(OUT) : [];
const del = new Map();
for (const line of SPEC.trim().split('\n')) {
  const [prefix, rest] = line.split(':').map((s) => s.trim());
  const dir = dirs.find((d) => d.startsWith(prefix));
  if (!dir) {
    console.log(`NO MATCH: ${prefix}`);
    continue;
  }
  const indices = rest === 'all' ? 'all' : rest.split(',').map((n) => parseInt(n.trim(), 10));
  del.set(dir, indices);
}

const credits = JSON.parse(await readFile(path.join(ROOT, 'src/data/imageCredits.json'), 'utf8'));
const { default: images } = await import('../src/data/watchImages.js');

for (const [slug, idxs] of del) {
  const dir = path.join(OUT, slug);
  if (!existsSync(dir)) continue;
  const files = readdirSync(dir)
    .filter((f) => f.endsWith('.jpg'))
    .sort();
  const toDelete = idxs === 'all' ? files : idxs.map((i) => `${i}.jpg`);
  for (const f of toDelete) {
    const p = path.join(dir, f);
    if (existsSync(p)) rmSync(p);
  }
  // renumber remaining sequentially
  const remaining = readdirSync(dir)
    .filter((f) => f.endsWith('.jpg'))
    .sort((a, b) => parseInt(a) - parseInt(b));
  const survivors = [];
  remaining.forEach((f, i) => {
    const n = `${i + 1}.jpg`;
    if (f !== n) renameSync(path.join(dir, f), path.join(dir, n));
    survivors.push(n);
  });
  // remap credits by original file number (entries carry `file: "N.jpg"`)
  const oldCreds = credits[slug] || [];
  const credByFile = new Map(oldCreds.map((c) => [c.file, c]));
  const keptFiles = remaining;
  const newCreds = [];
  for (let i = 0; i < keptFiles.length; i++) {
    const c = credByFile.get(keptFiles[i]);
    newCreds.push({ ...(c || {}), file: `${i + 1}.jpg` });
  }
  if (idxs === 'all' || !survivors.length) {
    delete credits[slug];
    delete images[slug];
  } else {
    credits[slug] = newCreds;
    images[slug] = survivors.map((f) => `/images/watches/${slug}/${f}`);
  }
}

await writeFile(
  path.join(ROOT, 'src/data/watchImages.js'),
  `export default ${JSON.stringify(images, null, 2)};\n`.replace(/"/g, "'")
);
await writeFile(path.join(ROOT, 'src/data/imageCredits.json'), JSON.stringify(credits, null, 2));

const counts = { 4: 0, 3: 0, 2: 0, 1: 0, 0: 0 };
const slugs = readdirSync(OUT);
for (const s of slugs) {
  const n = readdirSync(path.join(OUT, s)).filter((f) => f.endsWith('.jpg')).length;
  counts[n] = (counts[n] || 0) + 1;
}
console.log('counts:', counts, 'dirs:', slugs.length);
console.log('images entries:', Object.keys(images).length);
