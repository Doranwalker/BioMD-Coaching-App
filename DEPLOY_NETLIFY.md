# BioMD Leadership Conversation Coach — Netlify deployment

This package is a separate standalone Netlify project. It does **not** change or replace your current BioMD website. The public app includes an AI conversation coach and downloadable 1080 × 1350 JPG dashboard.

## Before you start

- A Netlify account (you likely have a BioMD team; log in to the correct team).
- Node.js LTS installed on your Windows computer: https://nodejs.org/
- A separate OpenAI API account with billing enabled: https://platform.openai.com/ . A paid ChatGPT subscription does not include API credits.
- Keep the API key private; do not add it to files, screenshots, posts, or chat messages.

## Step 1 — Download and extract

1. Download `BioMD_Leadership_Coach_Netlify_Ready.zip` from this conversation.
2. Right-click the ZIP, choose **Extract All**, then open the extracted `biomd-leadership-coach-netlify` folder.
3. In File Explorer, click its address bar, type `powershell`, press Enter. This opens PowerShell in the project folder.
4. Check that Node.js is installed:

```powershell
node --version
npm --version
```

If either command is missing, install Node.js LTS and reopen PowerShell.

## Step 2 — Sign in to Netlify

In the same PowerShell window:

```powershell
npm install -g netlify-cli
netlify login
```

A browser opens for Netlify authorization. Sign in to your BioMD team/account.

## Step 3 — Deploy a *new* project

Still in the extracted project folder, run:

```powershell
netlify deploy --prod
```

On first use, the CLI asks what to deploy. **Create and configure a new project**; do not pick your existing BioMD website. Choose your BioMD team, and a unique project name such as `biomd-leadership-coach`.

Netlify reads `netlify.toml`: `public` contains the site and `netlify/functions` contains the server-side AI endpoints. This is a full app deployment — don't drag the `public` folder alone to Netlify Drop, because that would omit its AI function.

When successful, Netlify prints your real address, similar to `https://YOUR-PROJECT.netlify.app`. The exact hostname is assigned by Netlify.

## Step 4 — Create the OpenAI API key

1. Sign in to https://platform.openai.com/ and enable API billing for your project.
2. Create an API key for a dedicated project such as `BioMD Leadership Coach`.
3. Configure a conservative spending budget/alerts and appropriate access restrictions. Charges are separate from ChatGPT subscriptions.
4. Copy the key only into Netlify, not into the source files.

## Step 5 — Configure the API secret in Netlify

1. Open https://app.netlify.com/ and select your **new** Leadership Coach project.
2. Navigate to **Project configuration → Environment variables**.
3. Add `OPENAI_API_KEY` with the secret value. Mark it as a secret/contains secret values where the UI offers that option.
4. Optionally set `AI_MODEL` to `gpt-5.4-mini` (the package uses this default if unset).
5. Redeploy the project for updated environment variables to take effect:

```powershell
netlify deploy --prod
```

The server-side Netlify function reads the key. It never belongs in `public/app.js` or `public/index.html`.

## Step 6 — Test before sharing

- Open `https://YOUR-PROJECT.netlify.app/api/status`. After the secret is active, it should return `{"aiReady":true}`.
- Open the homepage and begin a conversation. Make sure the session says **Live AI role-play**, not **Guided demonstration**.
- Test all four scenarios on desktop and mobile, complete at least two leader turns, and verify the feedback dashboard.
- Select **Download JPG dashboard**. Check that you received a real 1080 × 1350 `.jpg` file that looks readable.
- Confirm the generated scores and examples are clearly framed as illustrative coaching, not a validated leadership assessment.
- Confirm no patient records or identifiable employee details are entered.
- Check Netlify Functions metrics and your OpenAI usage after test sessions.

## Step 7 — Optional: set up the standalone BioMD subdomain

The initial `.netlify.app` URL works fine and is enough for a LinkedIn launch. You can add the custom subdomain later.

1. In your **Leadership Coach** Netlify project, open **Domain management → Add a domain you already own**.
2. Add `coach.biomdconsulting.com` to this **new project**.
3. If DNS is **already managed by Netlify**, follow Netlify's assignment prompts; it can create the corresponding record.
4. If DNS is **managed elsewhere** (for example, the registrar or another DNS provider), go to the current DNS manager and create one **CNAME** record:

    - Record type: `CNAME`
    - Host/Name: `coach`
    - Target/Value: `YOUR-PROJECT.netlify.app`

    Replace the target with your actual Netlify site hostname **without** `https://`. Netlify will also display customized DNS instructions for your domain; follow those if they differ.
5. Wait for DNS/HTTPS verification. Do **not** change your main site's root (`@`), `www`, mail/MX records, or nameservers just to attach this subdomain.
6. Check `https://coach.biomdconsulting.com` after Netlify indicates DNS and HTTPS are ready.

The domain registration company and DNS host may be different. Having a Porkbun account does **not** prove it currently manages BioMD's domain.

## Step 8 — Publish on LinkedIn

- Use a 4:5 image or screen recording of a fictional coaching session.
- Include the live link in the body or test link-in-comment versus link-in-body with real analytics.
- Never publish sample coaching dashboards containing real employee/patient details.
- Encourage visitors to share the tool, but avoid promising validated leadership measurement.

## Safety and cost notes

- The app's Netlify function includes **20 requests per minute per IP/domain grouping**, but this is imperfect protection. Bots and additional distributed users can still produce charges.
- Consider CAPTCHA/Turnstile and an additional platform-wide budget limit before a large public campaign.
- Netlify site use may consume your team's credits; check your current plan and balance. Historical BioMD emails from September 2026 reported 300 monthly credits, with 75% used during that period.
- The app does not intentionally store conversations in a database; OpenAI receives scenario content via API to produce AI messages and coaching. Provider logs/retention may apply.
- Seek privacy/legal review before public use in a healthcare setting. This is professional practice, not employee performance evaluation, clinical, legal, or HR advice.

## Troubleshooting

- **It says Guided demonstration:** Check `OPENAI_API_KEY` is saved for the new site and redeploy. Visit `/api/status` to confirm AI readiness.
- **API error:** Confirm your OpenAI project has billing and the key works; inspect Netlify Functions logs (and OpenAI API usage).
- **The default Netlify URL works but `coach.biomdconsulting.com` doesn't:** Check domain assignment on the **coach project**, the CNAME target and DNS propagation/HTTPS certificate.
- **The project replaced your main website:** Make sure you created a **new Netlify project**, not deployed to the existing BioMD project.

Official references:
- Netlify CLI manual deploys: https://docs.netlify.com/api-and-cli-guides/cli-guides/get-started-with-cli/
- Netlify Functions: https://docs.netlify.com/build/functions/get-started/
- Netlify environment variables: https://docs.netlify.com/build/environment-variables/get-started/
- Netlify external subdomain DNS: https://docs.netlify.com/manage/domains/configure-domains/configure-external-dns/
