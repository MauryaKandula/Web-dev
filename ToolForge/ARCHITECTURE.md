# ToolForge architecture

## Application flow

1. React and Vite render the developer marketplace and the built-in creator tools.
2. The Express API provides account, catalog, library, and creator endpoints.
3. Node.js 24 SQLite stores accounts, products, orders, entitlements, reviews, and webhook event IDs.
4. Razorpay is optional and disabled until server-side credentials are configured. The API creates an order at the product’s stored price, verifies the callback signature, and confirms captured payment data with Razorpay before issuing a license.
5. Raw signed webhooks are validated and deduplicated before captured-payment fulfillment.

## Payment boundaries

The database tracks the platform fee and creator earnings for display. It does not move money. Creator linked accounts, Route transfers, refunds, recurring memberships, and settlement reconciliation remain launch work.

Development-only simulated checkout and demo accounts are not available when NODE_ENV=production. Production startup requires a strong JWT_SECRET.

## Local data

SQLite, uploaded packages, generated build output, and dependencies are local runtime data and are ignored by Git. The repository’s downloaded upstream tool archives are kept outside the publication set until their licenses are verified.