# Next steps for Cloudflare Workers pilot

## Status checked 2026-11-05
- Cloudflare Dashboard shows an existing **reeva-360** Cloudflare Pages project, with a green production deployment of the `main` source branch. This is **an existing production project**, not the private Worker gateway.
- The Cloudflare connector authenticates the user's account but **cannot list R2, Workers or KV** because its granted scopes are insufficient (403/401). A Chrome login does not grant permissions to the ChatGPT connector.
- Do **not** click `Create deployment` inside `reeva-360`. Do not replace, delete, or move existing production Pages.
- A28 is currently public (Wix TEST frontend + public image CDN) and MUST NOT be relabeled as private.

## Already prepared
- `worker.mjs`: separate private-asset Worker reference (R2 + KV).
- `worker.test.mjs`: local unit tests for token authorization, path safety, revocation, assets.
- `issue-link.mjs`: local-only random-token generator with house/consent requirements. Does not touch Cloudflare.

## Safest integration plan
1. Keep the `reeva-360` Pages project and its production deployment entirely untouched.
2. Inspect current account billing status, Workers availability, R2 activation conditions, and KV limits before creating anything.
3. Create **a new isolated Worker**, not Pages deployment, with a project-specific name (e.g. `reeva-shared-gateway-test`), only on confirmed free-tier resources.
4. Create a private R2 bucket only if free-tier availability has been verified and requires **no paid-service activation**. Disable `r2.dev` and custom public bucket domains.
5. Create a dedicated KV namespace, and bind it and the private bucket to Worker as `TOUR_ACL` and `TOUR_TILES`.
6. Upload a non-owner synthetic HTML + tiny JPEG test set to R2 `homes/DEMO/`. Test all paths under /t/<token>/...
7. Generate a token with `issue-link.mjs` on trusted machine, insert its hash-key and metadata into KV. Verify valid token 200 and unknown/disabled token 404 for both HTML and image.
8. Test the consequences of KV's eventual consistency when revoking a link, and observe request/storage usage.
9. Only after separate approval and confirmed consent, design staff upload, optional secure password gate, backup and rollout.

## Important access considerations
- The access link is a bearer secret; anyone who receives it can forward it.
- Every tile request currently checks KV; costs and limits must be checked before scaling.
- KV revocation can be delayed by propagation. This is not an instant kill switch.
- Code tests with mocks are not proof of live R2/Workers functionality.
- No real homeowner photos or other personal data in this public repo.
