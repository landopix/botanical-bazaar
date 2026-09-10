# Product zones and restock alerts

The product card resolves `shopify.hardiness-zone` references through the Storefront API and reads each referenced metaobject's `label` field. For example, the Heliconia product currently returns `10b`, `11a`, and `11b`. Zone 10a is therefore outside its winter hardiness range; 10b is inside. Missing zone data is explicitly reported as unconfirmed.

## Notification flow

1. `/api/notify-me` validates the email, product handle, and optional Shopify variant GID. Product names, sizes, and availability are re-read from Shopify rather than trusted from the browser.
2. A private, site-wide Netlify Blobs store, `plant-restock-v1`, saves the request before the form reports success. The key hashes the email, handle, and variant. Repeated pending signups reuse the same record.
3. Resend sends a branded confirmation. A provider failure leaves the request saved and the confirmation queued. The response accurately distinguishes queued confirmation from accepted confirmation.
4. `netlify/functions/restock-check.mjs` runs every 15 minutes on the production deployment. It rotates through up to 20 pending requests per invocation, checking fresh Shopify availability for the exact requested size. Larger queues may require multiple runs.
5. Once confirmation is accepted and the selection is available, the worker sends the restock email and records the provider email ID. The customer link selects that variant. The email does not promise reserved inventory.
6. The cancellation link opens a confirmation form. GET does not cancel the alert, protecting against email-link scanners. POST uses an unguessable token and conditional writes to cancel it.

Nursery-release requests retain their separate staff notification and are not treated as an individual plant restock. Waitlist signup does not subscribe anyone to the newsletter.

## Runtime configuration and rollout

- `RESEND_API_KEY` must be valid and available to Netlify Functions. The sender defaults to `The Botanical Bazaar <info@thebotanicalbazaar.com>`; `RESEND_FROM_EMAIL` can override it.
- Live storage and sending are restricted to `CONTEXT=production`. Preview/local form submissions fail closed, avoiding access to the production waitlist.
- Netlify Blobs uses the Functions environment's automatically provided site credentials. Do not add a personal access token to the application.
- Deploy the Next.js routes and scheduled function together. Confirm the scheduled function appears in Netlify and successfully runs after deployment.
- Before declaring the rollout complete, exercise production signup, confirm storage and delivered email status, and verify a controlled restock through the deployed worker. Local and connector tests alone do not prove that deployed chain.

## Failures and reconciliation

The outbox saves the exact message before sending, claims a two-minute lease with an ETag conditional write, and supplies a stable per-cycle/per-phase Resend idempotency key. Transient failures retry on subsequent scheduled runs. Ambiguous attempts older than 23 hours are marked `needsReview` and logged rather than resent after Resend's 24-hour deduplication window. Inspect the recorded phase, provider email ID, and Resend logs before resolving such a record. A provider-accepted email is not the same as delivered; use Resend delivery/bounce status for diagnosis.

Pre-existing waitlist requests were sent to the nursery mailbox only. They are not automatically migrated into the new store and need a separate review of that mailbox before importing.

## Verification

- `node --test tests/restock-zone.test.mjs`: Shopify reference resolution, zone boundaries, input validation, duplicate registration, exact-size availability, concurrent delivery, retry identity, expired ambiguity, cancellation, and HTML escaping.
- A production-mode local build and interactive browser checks cover zone selection/persistence, mobile layout, form error and mocked success states, and variant selection from the email URL.
- Synthetic records in a separate Netlify verification store verify actual persistence, duplicate handling, and cancellation without modifying inventory.
- Two clearly marked template previews sent through the connected Resend account to `info@thebotanicalbazaar.com` were confirmed delivered. The old local `.env.local` Resend key was invalid; it is not used as evidence about the protected production key.

References: [Shopify Storefront references](https://shopify.dev/docs/api/storefront/2026-07/unions/MetafieldReference), [Netlify Blobs](https://docs.netlify.com/build/data-and-storage/netlify-blobs/), [scheduled functions](https://docs.netlify.com/build/functions/scheduled-functions/), [Resend idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys).
