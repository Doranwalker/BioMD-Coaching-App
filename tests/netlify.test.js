import test from 'node:test';
import assert from 'node:assert/strict';
import handler, { config } from '../netlify/functions/api.mjs';

test('Netlify function routes the status endpoint', async () => {
  const prior = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  try {
    const result = await handler(new Request('https://example.netlify.app/api/status'), {});
    assert.equal(result.status, 200);
    assert.deepEqual(await result.json(), {aiReady:false});
    assert.deepEqual(config.path, ['/api/status','/api/coach']);
    assert.ok(config.rateLimit.windowLimit > 0);
  } finally {
    if(prior===undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY=prior;
  }
});
