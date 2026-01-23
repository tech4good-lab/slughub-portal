(async () => {
  let fetchFn = global.fetch;
  if (!fetchFn) {
    try {
      const nf = await import('node-fetch');
      fetchFn = nf.default;
    } catch (e) {
      console.error('Please install node-fetch or run this from an environment with global fetch');
      process.exit(1);
    }
  }

  const base = 'http://localhost:3000';
  async function post(action, value) {
    const res = await fetchFn(base + '/api/debug/airtable-stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(value ? { action, value } : { action }),
    });
    return res.json();
  }

  async function getStats() {
    const r = await fetchFn(base + '/api/debug/airtable-stats');
    return r.json();
  }

  const endpoints = ['/api/clubs', '/api/admin/clubs/pending', '/api/admin/access-requests/pending', '/api/access-requests'];
  async function hit(iterations = 30) {
    for (let i = 0; i < iterations; i++) {
      await Promise.all(endpoints.map(u => fetchFn(base + u).catch(() => null)));
    }
  }

  const iterations = parseInt(process.argv[2], 10) || 30;

  console.log('\n=== NO-CACHE RUN ===');
  await post('reset');
  await post('setForceNoCache', true);
  await hit(iterations);
  console.log(JSON.stringify(await getStats(), null, 2));

  console.log('\n=== CACHED RUN ===');
  await post('reset');
  await post('setForceNoCache', false);
  await hit(iterations);
  console.log(JSON.stringify(await getStats(), null, 2));

  process.exit(0);
})();
