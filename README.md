# buglens-next

The marketing site, blog, and customer dashboard for [BugLens](https://buglens.app) — built with Next.js 16.

`buglens-core` handles the GitHub webhook + AI review pipeline; this app is everything the user sees: landing pages, auth, billing, and the dashboard that surfaces review activity.

## Structure

```
app/
├─ (landing)/     marketing pages — home, pricing, blog, changelog, security, alternatives
├─ (auth)/
│  └─ (shell)/    logged-in dashboard — dashboard, repos, reviews, analytics, knowledge, billing, settings, profile
├─ admin/         internal admin dashboard (OSS program approvals, usage stats)
└─ api/           route handlers — GitHub repo listing, Dodo Payments checkout/portal/webhook, admin actions
```

Auth is GitHub OAuth via Supabase. The dashboard reads directly from the `profiles`, `reviews`, and `findings` tables that `buglens-core` writes to after each PR review — the two apps share one Supabase project.

## Dashboard features

- **Overview** — usage against plan limit, recent PR reviews, critical (HIGH severity) finding count, webhook status
- **Repos** — connect/disconnect GitHub repos for review
- **Reviews** — full review history and per-PR finding detail
- **Knowledge base** — team-authored "Lessons" that get fed back into future AI reviews
- **Analytics** — bug pattern and code health trends over time
- **Billing** — plan tier, upgrade flow via Dodo Payments

## Environment

Create a `.env.local` file in the project root with:

```bash
NEXT_PUBLIC_SITE_URL=https://buglens.app
NOTION_TOKEN=secret_your_notion_integration_token
NOTION_DATABASE_ID=your_notion_database_id
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_BUGLENS_CORE_WEBHOOK_URL=http://localhost:3001/webhook
WEBHOOK_SECRET=shared_webhook_secret_for_buglens_core
DODO_PAYMENTS_WEBHOOK_KEY=whsec_your_dodo_webhook_key
ADMIN_GITHUB_USERNAMES=your_github_login
ADMIN_EMAILS=you@example.com
POLAR_SERVER=sandbox
POLAR_ACCESS_TOKEN=polar_access_token
POLAR_WEBHOOK_SECRET=polar_webhook_secret
NEXT_PUBLIC_POLAR_PRODUCT_ID=polar_pro_product_id
NEXT_PUBLIC_POLAR_BUSINESS_PRODUCT_ID=polar_business_product_id
```

Notes:

- `NOTION_TOKEN` is the internal integration token from your Notion integration.
- `NOTION_DATABASE_ID` is the database identifier for the blog CMS.
- if the Notion env vars are missing, the app falls back to local demo blog posts.
- `SUPABASE_SERVICE_ROLE_KEY` is required for Dodo webhook writes into `profiles` and `billing_history`.
- `WEBHOOK_SECRET` must match `buglens-core`. It is server-only; never return it to the browser.
- `ADMIN_GITHUB_USERNAMES` / `ADMIN_EMAILS` are comma-separated allowlists. If both are empty, `/admin` is denied for everyone.
- `POLAR_SERVER=sandbox` should only be used with sandbox Polar products; switch to `production` for live checkout. Live billing today is Dodo.

## Notion CMS Setup

1. Create a Notion integration at `https://www.notion.so/profile/integrations`.
2. Copy the internal integration token into `NOTION_TOKEN`.
3. Open your blog database in Notion and connect the integration to that database.
4. Copy the database ID from the Notion URL into `NOTION_DATABASE_ID`.
5. Make sure the database has these properties:
   - `Title`
   - `Slug`
   - `Excerpt`
   - `Author`
   - `Tag`
   - `Published`
   - `PublishedAt`
   - `UpdatedAt`
   - `ReadTime`
   - `SeoTitle`
   - `SeoDescription`

## Getting Started

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000). The dashboard routes under `/dashboard` require a logged-in Supabase session (GitHub OAuth via `/login`).

## Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start dev server |
| `yarn build` | Production build |
| `yarn lint` | Run ESLint |
| `yarn notion:setup-blog` | Provision the Notion blog database schema |
| `yarn notion:publish-sample-post` | Push a sample post to the connected Notion database |

## Deployment

Deployed on Vercel at [buglens.app](https://buglens.app). Set all env vars above in the Vercel project settings before deploying.
