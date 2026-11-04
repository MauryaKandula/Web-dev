# ToolForge

A developer-focused toolkit preview with five first-party workflow tools. The full React app and Express API source live in [ToolForge/](ToolForge/). GitHub Pages serves a static overview from [index.html](index.html); it does not host the full application backend.

## Featured tools

1. **RepoLens — Codebase onboarding.** Explore the included sample structure or upload a local text manifest to map folders, infer likely technologies, and draft a first-run setup guide. Remote GitHub import is not connected.
2. **InterviewLab — DSA practice.** Work through data structures and algorithms by topic, follow the practice workflow, and review progress in one place.
3. **PlacementForge — Resume and job-fit workspace.** Tailor a developer resume to a job description, review keyword coverage, and prepare an application copy. Review suggestions and keep all experience accurate.
4. **PortfolioDeploy — Portfolio builder.** Choose projects, organize descriptions, preview the result, and export a static portfolio bundle designed for GitHub Pages or another static host.
5. **FreelanceOS — Client work organizer.** Draft proposals, organize milestones, and prepare invoice details for freelance engagements.

See the [full feature descriptions](ToolForge/FEATURED_TOOLS.md) and each tool page in [ToolForge/src/client/pages](ToolForge/src/client/pages/).

## Run the app locally

Requires Node.js 24.18 or later.

```powershell
cd ToolForge
npm ci
Copy-Item .env.example .env
npm test
npm run build
```

Set a fresh random `JWT_SECRET` in the local `.env`. Start the API with `npm run dev` and the Vite client with `npm run dev:client` in separate terminals. Full setup and architecture notes are in [ToolForge/README.md](ToolForge/README.md).

## Current product and payment status

ToolForge is a development preview. No storefront listings, live payments, recurring creator memberships, file uploads, or creator payouts are active. New creator submissions are held for review, and downloads require a real package in private storage.

The API includes a server-created Razorpay order flow, checkout signature verification, captured-payment confirmation, and webhook validation. It has not been tested against a merchant account because no credentials were available. Simulated checkout is development-only. Creator fee splits are ledger calculations; Razorpay Route transfers and Subscriptions are not implemented.

Official references: [Standard Checkout](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/), [Create an Order](https://razorpay.com/docs/api/orders/create/), [Webhook validation](https://razorpay.com/docs/webhooks/validate-test/), [Subscriptions](https://razorpay.com/docs/payments/subscriptions/), and [Route](https://razorpay.com/route/).

## Publication boundary

Local databases, environment files, private storage, downloaded upstream repositories, archive packages, generated builds, and dependencies are excluded. The upstream archives were not published because their individual licenses and redistribution rights have not been reviewed. See [ToolForge/SECURITY.md](ToolForge/SECURITY.md) and [ToolForge/SOURCE_PROVENANCE.md](ToolForge/SOURCE_PROVENANCE.md).
