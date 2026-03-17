
# Marketing Candidate Journey - Full Build

This package includes:

- React + Vite frontend for GitHub Pages
- Candidate portal
- Admin dashboard starter
- Supabase Storage uploads
- Supabase Edge Function
- Resend email sending
- SQL schema for candidate data

## 1) Install and run locally

```bash
npm install
npm run dev
```

## 2) Frontend setup

Open `src/config.js` and replace:

- `supabaseUrl`
- `supabaseAnonKey`

Keep the Resend API key **out of the frontend**.

## 3) Supabase setup

### A. Run the SQL
Open Supabase SQL Editor and run:

`supabase/schema.sql`

### B. Create secrets for Edge Function
In Supabase project settings or CLI, add:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `HR_TO_EMAIL`
- `FROM_EMAIL`

Example:

- `HR_TO_EMAIL=careers@azzurrohotels.com`
- `FROM_EMAIL=Azzurro Hiring <onboarding@yourdomain.com>`

### C. Deploy the Edge Function

```bash
supabase functions deploy marketing-candidate-submit
```

Or deploy it from the Supabase dashboard.

## 4) GitHub Pages deployment

This app uses:

```js
base: './'
```

in `vite.config.js`, which works well for GitHub Pages static hosting.

Build:

```bash
npm run build
```

Then upload the contents of `dist/` to your GitHub Pages branch or deploy through GitHub Actions.

## 5) How the full flow works

1. Candidate opens the portal on GitHub Pages.
2. Candidate fills out forms and uploads files.
3. Files upload to Supabase Storage.
4. The form sends a payload to the Edge Function.
5. The Edge Function:
   - stores the candidate row in Supabase
   - stores uploaded file metadata
   - emails HR through Resend

## 6) Notes

- The admin dashboard screen in this build is a starter UI only.
- Public insert is currently enabled so anonymous candidates can submit.
- For production hardening, add:
  - hCaptcha or Cloudflare Turnstile
  - rate limiting
  - stronger RLS
  - admin auth for internal dashboard reads

## 7) Recommended next upgrades

- actual login links for candidates
- Lisa review scoring saved to Supabase
- stage lock rules
- candidate status update actions
- interview booking link
- automatic reply email to candidates

## 8) Frontend file map

- `src/App.jsx` main UI
- `src/styles.css` styles
- `src/config.js` public config
- `src/lib/supabaseClient.js` client

## 9) Backend file map

- `supabase/schema.sql`
- `supabase/functions/marketing-candidate-submit/index.ts`

