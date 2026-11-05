#!/usr/bin/env node
/**
 * LOCAL-ONLY helper. Prints draft Cloudflare KV metadata for a new Shared Tour.
 * Does NOT call Cloudflare, upload media, or change any public website.
 * Run on a trusted staff machine, NEVER in CI or screen recordings.
 *
 * node experiments/private-asset-gateway/issue-link.mjs \
 *   --house DEMO --consent-confirmed --origin https://YOUR-WORKER.workers.dev
 *
 * Requires private R2 prefix homes/DEMO/ to be uploaded via an authorized process.
 */
import { randomBytes, createHash } from "node:crypto";

const args = process.argv.slice(2);
function option(flag) {
  const i = args.indexOf(flag);
  return i < 0 ? undefined : args[i + 1];
}
const house = option("--house");
const origin = option("--origin");
const consent = args.includes("--consent-confirmed");
const help = args.includes("--help") || args.includes("-h");
if (help) {
  console.log("Usage: node issue-link.mjs --house HOUSEID --origin https://HOST --consent-confirmed");
  process.exit(0);
}
if (!consent || !house || !/^[A-Za-z0-9_-]{1,48}$/.test(house)) {
  console.error("Refusing to issue link: valid house code and confirmed homeowner permission required.");
  process.exit(1);
}
let host;
try { host = new URL(origin); } catch { /* invalid */ }
if (!host || host.protocol !== "https:" || host.username || host.password || host.search || host.hash || host.pathname !== "/") {
  console.error("Refusing: --origin must be a clean HTTPS Worker origin.");
  process.exit(1);
}
const token = randomBytes(32).toString("base64url");
const hash = createHash("sha256").update(token).digest("hex");
const key = "token:" + hash;
const value = { enabled: true, prefix: "homes/" + house + "/", consentConfirmed: true };
console.log("PRIVATE LINK — send to approved recipient only; do not paste in GitHub:");
console.log(host.origin + "/t/" + token + "/index.html");
console.log("\nKV key (does not expose the token):");
console.log(key);
console.log("\nKV value (store in TOUR_ACL, AFTER verifying the private bucket):");
console.log(JSON.stringify(value));
console.log("\nTo disable, set enabled:false or delete the KV key. Revocation propagation is not instant.");
