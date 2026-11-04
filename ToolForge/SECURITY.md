# Security policy

ToolForge is a development prototype. Do not use it to accept live payments or distribute unreviewed files.

## Payment handling

- The browser sends product and payment identifiers; product prices are read from the server database.
- Razorpay orders are created server-side in INR paise.
- The API verifies checkout signatures and confirms captured status, amount, currency, and order association through Razorpay before fulfillment.
- Webhook signatures are checked against the original raw request body. Event IDs are recorded to make fulfillment idempotent.
- Missing Razorpay credentials cause checkout and webhook verification to fail closed. There are no fallback payment secrets.
- Simulated payment endpoints and seeded demo accounts are development-only.
- Creator commission figures are accounting records. No payout, escrow, or linked-account transfer is implemented.

## Application security

- Production startup requires a JWT secret of at least 32 characters.
- Public registration can create customer or creator accounts, never administrators.
- User-uploaded packages must remain in private storage and pass the extension and integrity checks before delivery.
- Keep .env, SQLite databases, private storage, and merchant credentials out of source control.
- Do not publish downloaded upstream tool archives until each package’s license and integrity are reviewed.

Report security issues privately to the project owner. Do not include live credentials or customer data in issue reports.