// Public /api/status and /api/coach endpoints, served by Netlify Functions.
// The OpenAI API key stays in Netlify project environment variables.
import { handleApi } from '../../src/worker.js';

export default async function handler(request, context) {
  const env = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    AI_MODEL: process.env.AI_MODEL || 'gpt-5.4-mini'
  };
  return handleApi(request, env);
}

export const config = {
  path: ['/api/status', '/api/coach'],
  rateLimit: {
    windowLimit: 20,
    windowSize: 60,
    aggregateBy: ['ip','domain']
  }
};
