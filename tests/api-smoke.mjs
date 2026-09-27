// API smoke test: node tests/api-smoke.mjs (server must be running on :4000)
const base = process.env.API_URL || 'http://localhost:4000/api';
const check = async (name, fn) => {
  try {
    await fn();
    console.log(`PASS ${name}`);
  } catch (e) {
    console.error(`FAIL ${name}: ${e.message}`);
    process.exitCode = 1;
  }
};
const get = async (p) => {
  const r = await fetch(`${base}${p}`);
  if (!r.ok) throw new Error(`${r.status}`);
  return r.json();
};

await check('health', async () => {
  const r = await get('/health');
  if (!r.ok) throw new Error('not ok');
});
await check('watches list', async () => {
  const r = await get('/watches');
  if (!Array.isArray(r) || !r.length) throw new Error('empty');
});
await check('watch detail', async () => {
  const r = await get('/watches');
  await get(`/watches/${r[0].slug}`);
});
await check('auth rejects bad login', async () => {
  const r = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'none@x.com', password: 'wrong-password' }),
  });
  if (r.ok) throw new Error('expected 401');
});
await check('shipping rates', async () => {
  const r = await get('/shipping-rates');
  if (!r.length) throw new Error('empty');
});
