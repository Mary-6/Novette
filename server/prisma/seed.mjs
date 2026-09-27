import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { writeFileSync, mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const prisma = new PrismaClient();

// watches.js is ESM with extensionless imports — render to JSON via vite-node-free eval:
// easiest path is a small loader that strips imports and evaluates the array.
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const src = (await import('fs')).readFileSync(
  new URL('../../src/data/watches.js', import.meta.url),
  'utf8'
);

const tmp = mkdtempSync(join(tmpdir(), 'aw-seed-'));
// Replace the two image imports with empty maps and export via a CommonJS bridge.
const js = src
  .replace(/import watchImages from '.*';/, 'const watchImages = {};')
  .replace(/import visualizationImages from '.*';/, 'const visualizationImages = {};')
  .replace('export default watches;', 'module.exports = watches;')
  .replace('export default enriched;', 'module.exports = enriched;');
writeFileSync(join(tmp, 'watches.cjs'), js);
const watches = require(join(tmp, 'watches.cjs'));

for (const w of watches) {
  await prisma.watch.upsert({
    where: { slug: w.slug },
    update: {},
    create: {
      id: w.id,
      slug: w.slug,
      brandSlug: w.brandSlug,
      model: w.model,
      reference: w.reference,
      nickname: w.nickname || null,
      price: w.price,
      year: w.year,
      type: w.type,
      material: w.material || null,
      condition: w.condition,
      gender: w.gender,
      boxPapers: Boolean(w.boxPapers),
      isNew: Boolean(w.isNew),
      isFeatured: Boolean(w.isFeatured),
      popularity: w.popularity ?? 50,
      addedAt: new Date(w.addedAt),
      description: w.description,
      specs: w.specs,
      inventory: 1,
    },
  });
}
console.log(`Seeded ${watches.length} watches.`);
await prisma.$disconnect();
