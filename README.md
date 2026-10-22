# BioMD Leadership Conversation Coach — Netlify edition

A standalone healthcare leadership role-play app with AI conversation practice and a downloadable **LinkedIn-sized JPG dashboard (1080 × 1350, 4:5)**.

## Publish it

**Read [`DEPLOY_NETLIFY.md`](DEPLOY_NETLIFY.md) for complete Windows-friendly steps.**

Quick commands in the extracted project folder:

```powershell
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

Choose **Create a new project** in your existing BioMD Netlify team. Then add `OPENAI_API_KEY` under the *new* project's environment variables and deploy again. Never put a secret into a public file.

The included Netlify Function routes `/api/status` and `/api/coach`, calls the OpenAI Responses API server-side and has Netlify rate-limiting configuration. The app retains scripted guided demo mode if no key is configured.

## App folders

- `public/index.html` — landing page and UI markup
- `public/styles.css` — responsive styling
- `public/app.js` — scenario selections, chat flow, analysis dashboard, and client-side JPG export
- `public/social-preview.png` — promotional image
- `netlify/functions/api.mjs` — Netlify Functions adapter, endpoint routes, per-IP rate limit
- `src/worker.js` — shared API validation and OpenAI logic
- `netlify.toml` — Netlify build and function settings
- `tests/` — backend tests

## Safety

The dashboard is an AI-generated coaching reflection for fictional practice. Scores are **illustrative, not scientifically validated** and must not be used to assess staff. Do not submit patient information, employee identities, or confidential details. User input is processed by OpenAI; the app does not intentionally persist the transcript in its own database. API and hosting usage may incur charges.
