/**
 * REEVA Shared Tour private asset gateway — REFERENCE IMPLEMENTATION, NOT DEPLOYED.
 *
 * Cloudflare Worker bindings:
 *   TOUR_TILES: private R2 bucket (no r2.dev or other public object endpoint)
 *   TOUR_ACL: KV namespace (key: token:<SHA256-of-share-token>)
 *
 * KV value example (admin-set only, never shipped to visitors):
 *   {"enabled":true,"prefix":"homes/EXAMPLE/","consentConfirmed":true}
 *
 * URL shape:
 *   https://<private-share-host>/t/<random-32-to-128-character-token>/index.html
 *
 * Token must be generated using a cryptographically secure RNG outside the browser.
 * Whoever possesses the URL can share it. Do not put homeowner files in the public repo.
 *
 * WARNING: No password mode implemented. Any password gate MUST be server-side and
 * authenticate before all objects, including JPEG tiles, are returned.
 */

const SAFE_TOKEN = /^[A-Za-z0-9_-]{32,128}$/;
const CONTENT_TYPES = Object.freeze({
  html: "text/html; charset=utf-8",
  js: "text/javascript; charset=utf-8",
  css: "text/css; charset=utf-8",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
  webp: "image/webp",
  json: "application/json; charset=utf-8"
});
const HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Cross-Origin-Resource-Policy": "same-origin"
};

function notFound() {
  return new Response("Tour not available", { status: 404, headers: HEADERS });
}
function segmentsFromRawUrl(rawUrl) {
  // Parse the path from raw URL before URL path normalization so e.g. /../
  // cannot be silently collapsed into another valid object path.
  const rawPath = rawUrl.split("?", 1)[0].replace(/^https?:\/\/[^/]+/i, "");
  if (!rawPath.startsWith("/t/")) return null;
  const rawSegments = rawPath.split("/").slice(1);
  if (rawSegments.length < 3 || rawSegments[0] !== "t") return null;
  try {
    const clean = rawSegments.map(s => decodeURIComponent(s));
    if (clean.some(s => !s || s === "." || s === ".." || /[\\/\x00-\x1F]/.test(s) || s.includes("%"))) return null;
    const token = clean[1];
    if (!SAFE_TOKEN.test(token)) return null;
    return { token, key: clean.slice(2).join("/") };
  } catch { return null; }
}
async function tokenHash(token) {
  const bytes = new TextEncoder().encode(token);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("");
}

export default {
  async fetch(request, env) {
    if (request.method !== "GET" && request.method !== "HEAD") return notFound();
    if (!env.TOUR_ACL || !env.TOUR_TILES) return new Response("Not configured", { status: 503, headers: HEADERS });
    const route = segmentsFromRawUrl(request.url);
    if (!route) return notFound();

    const meta = await env.TOUR_ACL.get("token:" + await tokenHash(route.token), "json");
    if (!meta || meta.enabled !== true || meta.consentConfirmed !== true ||
        typeof meta.prefix !== "string" || !/^homes\/[A-Za-z0-9_-]+\/$/.test(meta.prefix)) {
      return notFound();
    }
    const key = meta.prefix + route.key;
    const ext = route.key.split(".").pop().toLowerCase();
    if (!Object.hasOwn(CONTENT_TYPES, ext)) return notFound();

    const object = await env.TOUR_TILES.get(key);
    if (!object) return notFound();
    const headers = new Headers(HEADERS);
    headers.set("Content-Type", CONTENT_TYPES[ext]);
    headers.set("Content-Length", String(object.size));
    // Important: private R2 bucket must not have a public bypass URL.
    return new Response(request.method === "HEAD" ? null : object.body, { status: 200, headers });
  }
};
