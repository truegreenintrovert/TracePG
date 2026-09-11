# TracePG

TracePG is a Node.js frontend for NEET-PG preparation, built with React, Vite, and Tailwind CSS. It keeps the question bank reusable under `src/data/` and connects to a small serverless progress-sync layer.

## What is included

- React/Vite frontend with a proper `src/` structure.
- Tailwind CSS design system in `src/styles.css`.
- Reusable shell, question cards, dashboard, test runner, analytics, revision, notes, and PYQ views.
- Lazy-loaded question and PYQ data chunks so the app shell loads quickly.
- Cloudflare Pages hosting for the built app.
- Cloudflare Pages Functions under `functions/api/`.
- Cloudflare D1 storage for authenticated user profiles, progress, payment orders, and access entitlements.
- Supabase Auth for email/password and Google sign-in; passwords never enter D1.
- One active web session and one active mobile-app session per account.
- Local-first behavior: the app still keeps a local copy and syncs it after sign-in.
- One-time paid access flow with PayU; configured administrators bypass payment.
- Debounced cloud writes so answering questions does not create one database write per click.

TracePG uses Supabase Auth for account identity and D1 for account-scoped profiles and progress. Local storage is namespaced by the authenticated user ID, so switching accounts on the same device does not expose another user's history.

## One-time setup

1. Install Node.js 20+.
2. Install dependencies with `npm install`.
3. Create a D1 database named `tracepg` and copy its ID into `wrangler.toml`.
4. Create the local environment files from `.env.example` and `.dev.vars.example`.
5. Create the tables locally with `npm run db:local`.
6. Start the React frontend with `npm run dev`.
7. Use `npm run build` to create the production bundle, or `npm run preview` to inspect it locally.
8. Check production migration state with `npm run db:migrations:status`. Apply migrations only after reconciling the existing production database with the migration history; do not blindly replay seed migrations against a populated database.
9. Add the Supabase runtime variables to the Pages project, then deploy with `npm run deploy`.

## Authentication setup

1. Create a Supabase project and copy its Project URL and Publishable key into `.env` using the names in `.env.example`.
2. Enable Google under Supabase Authentication → Providers, then add the Google OAuth client ID and secret.
3. Add the local URL and `https://tracepg.pages.dev` to Supabase Authentication → URL Configuration.
4. Add `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` as Pages runtime variables. The same names can be copied from `.dev.vars.example` for local Functions development.
5. In Google Cloud, use the Supabase callback URL shown on the Google provider page as the OAuth redirect URI.

The API verifies the Supabase bearer token before reading or writing D1 progress. The production schema includes `users` and `user_progress`; the existing anonymous tables are retained for a safe transition.

### Device sign-in limits

TracePG allows one active web session and one active app session per account. Browser API requests identify themselves
with `X-TracePG-Client: web`; the Play Store app must send `X-TracePG-Client: app` with its authenticated API requests.
Signing out releases that client slot. An unused slot is reclaimed after 30 days so an abandoned browser or deleted app
does not permanently block the account.

## Admin panel

The authenticated admin panel is available at `/admin`. It can add main-bank questions, add PYQs, edit the Product, About Us, Contact Us, Help & Support, Q&A, Privacy Policy, Terms of Service, Refund Policy, Shipping Policy, and Cancellation Policy content stored in D1. About Us also includes admin-managed operator and team-member fields.

The Bulk upload tab accepts `.xlsx`, `.csv`, and text-based `.pdf` files. Spreadsheet headers should include `q, o1, o2, o3, o4, a`; use A-D for the answer column to avoid numeric-index ambiguity. PDF questions should use numbered questions followed by A-D options and an `Answer: B` style answer line. Image-only/scanned PDFs require OCR first.

Set the administrator allowlist as a Cloudflare Pages secret before using it:

```text
npx wrangler pages secret put ADMIN_EMAILS --project-name tracepg
```

Enter one or more Supabase account emails separated by commas. For local Pages Functions, add the same value to `.dev.vars` using the name in `.dev.vars.example`. Admin checks are performed server-side for every read and write.

The app entry point is `index.html`, which mounts `src/main.jsx`. The previous monolithic page is retained under `legacy/index-2.html` for reference only and is not part of the Vite build.

## Paid access and custom domain

TracePG offers one-time premium access plans at ₹298 for 1 year, ₹398 for 2 years, ₹598 for 3 years, ₹698 for 5 years, or ₹1,500 for lifetime access. A 50% percentage discount code reduces these to ₹149, ₹199, ₹299, ₹349, and ₹750 respectively. Timed plans can be renewed or upgraded, while lifetime access never expires. Each non-admin account can start three free trial tests of 20 questions each before upgrading. Administrators can manage percentage or fixed discount codes from the admin panel, including activation, expiry, and usage limits. Administrators listed in `ADMIN_EMAILS` or `ADMIN_USER_IDS` are granted unlimited access without payment. The question, trial, and checkout APIs check access server-side, so the paywall and discounts are not only frontend restrictions.

Add these Cloudflare Pages runtime variables/secrets before accepting payments:

```text
PAYU_ENV=test
PAYU_KEY
PAYU_SALT
APP_URL=https://tracepg.com
```

Configure the PayU successful-payment webhook URL as `https://tracepg.com/api/billing/webhook`. The hosted checkout return URL is generated by the server at `/api/billing/response`. Use `PAYU_ENV=test` while testing, then switch to `production` and replace the test merchant key and salt before launch.

Attach `tracepg.com` to the `tracepg` Pages project under Workers & Pages → Custom domains. For the apex domain, Cloudflare requires the domain to be added as a zone and its nameservers configured for Cloudflare. Update the Supabase Auth URL configuration and Google OAuth redirect settings to include `https://tracepg.com`.

## Capacity notes

For around 1,000 active users, the design keeps the question bank in cacheable static chunks and only syncs each user's compact progress object. The initial app shell is kept small, while the question and PYQ datasets load on demand. Watch D1 storage, request volume, and write latency after launch; the next scaling step is adding authenticated users, conflict timestamps, and analytics as separate append-only events instead of inflating the progress document.

## Production checklist

- Configure PayU test and live credentials and verify a complete payment in test mode and one controlled production payment.
- Reconcile and record D1 migrations before making further schema changes.
- Add a server-side rate limit at the edge for trial, feedback, admin, and billing endpoints.
- Set up D1 backups/export and a basic error alert.
- Add automated tests for account isolation, trial expiry, payment signatures, webhook replay, and discount limits.
- Load-test the API with realistic question reads and autosave traffic.
- Commit and tag each production release so Cloudflare deployments can be reproduced and rolled back.
