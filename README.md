## BugLens

### DATE - 08-04-2026

Marketing site and blog for BugLens, built with Next.js 16.

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
- `SUPABASE_SERVICE_ROLE_KEY` is required for Polar webhook writes into `profiles` and `billing_history`.
- `WEBHOOK_SECRET` must match `buglens-core` because both apps rely on the same signed webhook secret.
- `POLAR_SERVER=sandbox` should only be used with sandbox Polar products; switch to `production` for live checkout.

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

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
