#!/usr/bin/env node
/**
 * REEVA Shared Tour: compute the KV record to revoke, WITHOUT changing Cloudflare.
 * Read the whole shared URL from standard input, not command-line args, so secret
 * tokens do not appear in shell history or process listings.
 *
 * Example:
 *   node experiments/private-asset-gateway/revoke-link.mjs
 *   [paste the private link, press Enter, then Ctrl+D / Ctrl+Z Enter]
 *
 * Do not share the URL or its token in tickets, logs, GitHub, or screenshots.
 */
import { createHash } from "node:crypto";

let input = "";
for await (const chunk of process.stdin) {
  input += chunk;
  if (input.length > 4096) {
    console.error("Input too long. No changes made.");
    process.exit(1);
  }
}
const supplied = input.trim();
let link;
try { link = new URL(supplied); } catch { /* invalid */ }
if (!link || link.protocol !== "https:" || link.username || link.password ||
    link.search || link.hash ||
    !/^\/t\/[A-Za-z0-9_-]{32,128}\/index\.html$/.test(link.pathname)) {
  console.error("Expected a clean HTTPS Shared Tour link ending /t/<token>/index.html.");
  process.exit(1);
}
const token = link.pathname.split("/")[2];
const key = "token:" + createHash("sha256").update(token).digest("hex");
console.log("TOUR_ACL KV key to disable or delete:");
console.log(key);
console.log("Do NOT delete this key until an authorized administrator approves revocation.");
console.log("KV propagation can be delayed; confirm revocation for both HTML and image tiles.");
console.log("No Cloudflare request was made by this tool.");
