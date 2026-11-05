# REEVA Shared Tour: access-control prototype (NOT DEPLOYED)

## Tested product requirement
**A28 Public/Shared link viewer is already published on a separate Wix TEST site.** The source JPEG tiles are currently in the existing public GitHub repository, served through a public CDN. The link can be forwarded and is **not private**. Existing test site remains unchanged by this experiment.

## Why this prototype exists
A toggle in `share-tour.html` or a JavaScript password prompt cannot protect image assets. Browsers can request public JPEG tile URLs directly. For homeowner-only tours, **all HTML, CSS, JS, icons and tiles** must be served by an access-controlled host where the original R2 bucket has **no public endpoint**.

## Minimal private-link architecture
1. REEVA employee gets homeowner permission and captures a Marzipano export.
2. Authorized uploader validates `data.js`, paths and links, then uploads the export to **private Cloudflare R2** under `homes/HOUSEID/`, preserving the original relative directory structure. This MUST NOT be pushed to the public GitHub repository.
3. Administrator generates a random high-entropy share token; stores **only its SHA-256 hash** as a key in Cloudflare KV, along with `enabled:true`, `consentConfirmed:true`, and the R2 prefix.
4. Worker receives `/t/<token>/index.html` and all relative assets under the same prefix. It validates the token in KV **for each request** before reading an R2 object. This makes the link revocable.
5. To disable access, set KV `enabled:false` or remove its entry. Note KV propagation can be eventually consistent; **instant global revocation is not guaranteed**.
6. Wix main site lists **only approved Public tours**. Shared tours are sent to owners as links and not automatically listed anywhere.

## Strict limits of the current code
- Reference implementation in `worker.mjs` only. **Nothing is deployed, provisioned, purchased or charged.**
- It implements **revocable share-token links**, **not optional password authentication**.
- It does not implement administrative access, asset upload UI, token generation, rotation, user audit, abuse prevention, or expiration.
- It requires a separately configured private R2 bucket and KV namespace. Publishing these bindings and customer images requires approval.
- URL can be forwarded. No link or password system can prevent the recipient taking screenshots or redistributing seen content.
- The R2 bucket's `r2.dev` public URL and custom public domain must be disabled or absent. Otherwise users can bypass the Worker.
- Do not put the token into public GitHub, website JavaScript, analytics or referrer logs. Response header `Referrer-Policy: no-referrer` reduces propagation through navigation.
- A high-entropy URL is reasonable for *share-by-link* use; for homes needing stronger restrictions, add **server-side password verification and protected session cookies** before serving every file, not a client-side JavaScript password.
- Cloudflare R2 / Workers / KV plan limits, rates and billing must be verified for the user's actual account before any provisioning.

## Data example
`TOUR_ACL` key: `token:<sha256(token)>`

Value:
```json
{"enabled":true,"prefix":"homes/EXAMPLE/","consentConfirmed":true}
```

The token itself is not written to KV. Send it only to the intended homeowner over an approved channel.

## Access checks to pass before live use
- [ ] Consent and privacy checklist signed off for every homeowner house.
- [ ] Private R2 object NOT accessible through any public R2 endpoint.
- [ ] Valid token retrieves `index.html` and tile/image assets.
- [ ] Unknown, malformed, or revoked token yields 404 for **every** asset.
- [ ] Wrong house prefix / traversal / bypass attempts cannot read anything.
- [ ] Test KV revocation propagation and plan for tolerable delay.
- [ ] Test A28-like 13-scene Marzipano functionality end to end on test data.
- [ ] Password optional mode implemented securely and security-tested before advertising it.
- [ ] Staff upload/disable/reissue SOP, backup, expected operating costs confirmed.
- [ ] Explicit approval before adding customer-owned media or changing Wix production.

## Next decision checkpoint
Select whether REEVA will adopt a private R2 + Worker + KV hosting stack. This is a **material external service and billing decision**; do not activate it without owner approval. Meanwhile the existing Wix A28 link-sharing test continues working on its public assets.
