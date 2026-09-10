# September 2026 dependency security follow-up

Upgrade @netlify/blobs 10.5.0 to 10.7.13, preserving the SDK major version and existing Node 22 deployment runtime.

The new dependency tree removes image-size and the old Jaeger propagator, and upgrades OpenTelemetry core to patched 2.8.0/2.9.0. This addresses eight Dependabot records (four advisories tracked separately in npm and pnpm lockfiles): #76, #77, #78, #79, #80, #81, #82, #83.

Validation: restock lifecycle regression tests; actual SDK conditional-write contract test using an injected transport (no real email or production store mutation); npm package-lock audit. The SDK test verifies successful create, duplicate rejection and ETag-conditional update.

## Remaining alerts #69 and #70

GHSA-vwc7-r8mq-g2x9 affects adm-zip 0.5.9 through 0.6.0. As of September 10, 2026, the GitHub advisory lists no patched release and npm's latest release is 0.6.0. It requires a pre-existing attacker-controlled destination symlink and extraction with overwrite enabled. The project has no direct application import, but Sanity tooling still includes the package; this is not sufficient evidence to dismiss the alert as unused. Both alerts remain open.

Do not downgrade to vulnerable older adm-zip releases or replace packages with incompatible aliases to suppress alerts. Dependabot's existing weekly npm configuration remains enabled. Review the upstream fix when released: https://github.com/advisories/GHSA-vwc7-r8mq-g2x9

Expected closure: after this PR merges, GitHub should automatically close the eight resolved records when it reprocesses both lockfiles. They have not been manually dismissed.
