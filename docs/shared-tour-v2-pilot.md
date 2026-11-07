# REEVA Shared Tour V2 — A28 pilot (draft)

## Purpose
A separate link-shareable viewer for an already-exported Marzipano tour. The existing A28 scenes, 35 link hotspots, tile directory and controls remain unchanged. **This is not a private or password-protected page.**

## Scope of this change
- Adds `share-tour.html` on this feature branch only.
- Existing `index.html`, `tour-viewer.html`, `premium-app.js`, Marzipano export, and Wix website are **not changed**.
- A28 is the *only* whitelisted tour; unrecognized house codes show an error.
- The Share button copies/shares a direct URL once the page is deployed; it is disabled when opened as a local `file://` document.
- Does not involve Supabase or the old project-map listing.

## Proposed link *once deployed*, not yet live
`<site-base>/share-tour.html?house=A28`

## Safety / permissions
1. A person with the URL can forward it; do **not** use it for private homeowner content without consent.
2. Client-side passwords or "noindex" do not secure public JPG tiles. Server-side access enforcement would be necessary for stronger privacy. Wix password-protected pages protect the page route, not necessarily externally accessible images.
3. Adding future homeowners' tours requires documented owner approval and a deliberately controlled publication workflow.
4. Disable a shared link by taking the page offline or applying server-side access rules. Simply removing a registry entry makes this HTML page show "not found", but **does not revoke existing direct image URLs**.
5. A28 original files are already on the repository's public `main` branch; this pilot does not increase their file visibility through publication by itself.

## Validation checklist before release
- [ ] Open with HTTP(S) on a preview environment (not just local file)
- [ ] Confirm all 13 scenes and 35 existing scene-link hotspots work
- [ ] Test touch navigation, rotating/zooming, portrait/landscape phone layouts
- [ ] Verify link sharing via LINE and copy link
- [ ] Verify invalid and missing `house` parameter handling
- [ ] Verify owner consent for any tour classified Shared
- [ ] Decide hosting, URL, password method (if required), revocation policy
- [ ] Request explicit go-live approval; do not merge/publish based on this draft alone

## Architecture choice to validate
Prefer retaining a static host for Marzipano's complete relative `tiles` tree and embedding/linking from Wix, rather than renaming thousands of images into Wix Media Manager IDs. Wix stays the main marketing site. This is a proposal to evaluate, not a completed migration.

## Manual test
Host a checked-out copy with an ordinary static server and visit `/share-tour.html?house=A28`. The A28 export must remain in its current relative directory. This has not been browser-tested as part of this branch creation.
