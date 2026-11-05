# A28 Shared Tour V2 — QA report (5 November 2026)

## Source integrity
- Source: actual original `360 A28.zip` Marzipano export.
- The extracted `data.js`, `index.js` and `index.html` have exactly the same Git blob hashes as files in GitHub repository `main`.
- 13 scenes and 35 scene-link hotspots; all hotspot targets point to an existing scene.
- **1 additional info hotspot** exists in Kitchen (Housekeeping Storage Room). Preserve it.
- 6,643 expected JPG files, including 13 preview images; 6,643 found. No missing or extra JPG paths.
- Bundled Marzipano JavaScript, CSS and icon assets are present.

## Checks performed
A Node.js VM simulation of the actual inline code in `share-tour.html` passed 11 checks:
- Correct A28 iframe target and share button enablement.
- Clean canonical share URL copied to clipboard (drops unknown query params/hash).
- Lowercase house parameter and native share.
- Rejection of missing, unknown, prototype-pollution-like and path-like house codes.
- Sharing disabled for local `file://` documents.

`tests/shared-tour.logic.test.cjs` is committed to this draft branch for repeatability. Run `node tests/shared-tour.logic.test.cjs` from the repository root. This tests **client-side link logic only**, not browser rendering, password security or remote deployment.

## Browser verification limitation
Attempted an isolated local HTTP server and Chromium Playwright smoke test with the original A28 archive; the browser refused navigation with `net::ERR_BLOCKED_BY_ADMINISTRATOR` before the page loaded. Consequently **no browser-rendering or phone-device end-to-end pass is claimed**. Verify on an isolated HTTP(S) preview before any rollout.

## Security / privacy review
- The current GitHub `reeva-360` repository is **public**.
- A28 tiles are already available from the existing public repository. A URL containing `?house=A28` is not a security boundary.
- A Shared Tour hosted openly is **shareable, not private**. Do not upload real homeowner content to this public repository without express approval.
- `noindex` tags and client-side password gates cannot protect public tile URLs; optional password access requires real server-side enforcement with appropriate asset access controls.
- Revoking the viewer registry does not revoke URLs to publicly cached tile files.
- Don't expose proposed URLs as live links until hosting, permissions and approval are finalized.

## Release gates (pending)
- [ ] Deploy to **isolated private preview** without affecting the existing Wix site or current GitHub Pages.
- [ ] Test browser navigation through all 13 scenes and 35 link hotspots, plus Kitchen info hotspot.
- [ ] Test copy/share via HTTPS on desktop, Android and iOS (including LINE).
- [ ] Verify page availability, mobile display, errors, performance.
- [ ] Decide trusted static host/CDN, optionally password-protected mode, and documented revocation procedure.
- [ ] Obtain owner consent for each homeowner-owned tour.
- [ ] Explicit go-live approval before merge/publish, bulk upload, costs, or replacement of existing systems.

**Result:** Static A28 assets and 11 share-link logic tests passed. End-to-end Shared Tour deployment is **not yet validated**.
