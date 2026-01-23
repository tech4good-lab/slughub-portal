(async () => {
  const fetch = (...a) => import('node-fetch').then(m => m.default(...a));
  const base = 'http://localhost:3000';
  const endpoints = ['/api/clubs', '/api/admin/clubs/pending', '/api/admin/access-requests/pending', '/api/access-requests'];
  const iterations = parseInt(process.argv[2], 10) || 20;

  console.log('Running', iterations, 'iterations against', endpoints.length, 'endpoints');

  // Reset stats
  await fetch(base + '/api/debug/airtable-stats', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'reset' })
  });

  for (let i = 0; i < iterations; i++) {
    await Promise.all(endpoints.map((p) => fetch(base + p).catch(() => null)));
  }

  const res = await fetch(base + '/api/debug/airtable-stats');
  const json = await res.json();
  console.log('Stats after run:', JSON.stringify(json, null, 2));
})();
