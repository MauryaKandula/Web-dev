# ToolForge

ToolForge is a development preview for a developer-focused marketplace. It includes five first-party workflow tools and a backend foundation for one-time Razorpay checkout. No storefront listings, live payments, recurring memberships, or creator payouts are active in this publication.

## Featured tools

- [RepoLens](src/client/pages/RepoLensPage.tsx) — Explore a sample or upload a local text manifest to map folders and infer a stack. Remote GitHub import is not connected.
- [InterviewLab](src/client/pages/InterviewLabPage.tsx) — Practice data structures and algorithms with topic-based exercises and guided review.
- [PlacementForge](src/client/pages/PlacementForgePage.tsx) — Tailor a developer resume to a job description, review keyword coverage, and prepare an application copy.
- [PortfolioDeploy](src/client/pages/PortfolioDeployPage.tsx) — Assemble a GitHub-ready portfolio and export a static site bundle.
- [FreelanceOS](src/client/pages/FreelanceOSPage.tsx) — Draft proposals, organize client milestones, and prepare invoice details for freelance work.

The marketplace home page includes links to these tools. Full descriptions and current status are in [FEATURED_TOOLS.md](FEATURED_TOOLS.md).

## Stack

- React 19, TypeScript, Vite 8, Tailwind CSS 4
- Express 4 API
- Node.js 24 with the built-in SQLite module
- Vitest

## Run locally

Use Node.js 24.18 or later.

    npm ci
    Copy-Item .env.example .env
    npm test
    npm run build

Start the API in one terminal with npm run dev, then start the Vite client in a second terminal with npm run dev:client. The API listens on port 3005 and the development client on port 5173.

Set a new random JWT_SECRET in the local .env file. Do not commit .env, database files, private storage, or payment credentials. A fresh development database is created under data/.

Development-only role-switch identities use reserved `.test` addresses and random passwords. The demo-switch endpoint and manual seed command are disabled when `NODE_ENV=production`. Never deploy a development database.

## Razorpay status

The backend code creates Razorpay Orders from server-side prices, verifies checkout signatures, checks payment status and amount with Razorpay before fulfillment, and validates webhooks against the original raw request body. This flow has not been tested against a merchant account because no credentials were available during review.

Checkout needs `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`; webhook verification separately needs `RAZORPAY_WEBHOOK_SECRET`:

- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET
- RAZORPAY_WEBHOOK_SECRET

Use Razorpay Test Mode keys for development. Keep all secrets in the deployment environment, never in frontend code or GitHub. A payment is fulfilled only after Razorpay confirms it is captured. The simulated checkout route is development-only and does not charge money.

Creator fee splits are ledger calculations only; funds are not split or transferred. Creator onboarding and payouts need an approved Razorpay Route setup and linked accounts. Recurring memberships need the Razorpay Subscriptions integration, renewal and cancellation handling, entitlements, and webhook testing before ToolForge can work like Patreon. No live merchant credentials were available during this review.

Official Razorpay references: [Standard Checkout](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/), [Create an Order](https://razorpay.com/docs/api/orders/create/), [Validate webhooks](https://razorpay.com/docs/webhooks/validate-test/), [Subscriptions](https://razorpay.com/docs/payments/subscriptions/), and [Route](https://razorpay.com/route/).

Creator submissions remain pending review. Package upload, moderation, recurring memberships, and creator transfers are not implemented in this preview, so new submissions cannot be purchased or downloaded.

## Sample catalog and downloadable archives

The generated third-party catalog was removed because its source, licenses, package contents, and distribution rights had not been reviewed. The downloaded upstream repositories and ZIP archives remain local and are excluded from publication. New catalog products and reviews are not seeded automatically.

## Repository cleanup

Generated dist output, node_modules, local SQLite data, private storage, environment files, bulk downloaded repository archives, and the old bulk-publishing scripts are excluded from version control. The existing local files were left in place.

See SECURITY.md, ARCHITECTURE.md, and MONETIZATION.md for implementation boundaries and launch requirements.
