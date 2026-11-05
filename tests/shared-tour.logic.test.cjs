#!/usr/bin/env node
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert/strict");

const html = fs.readFileSync(path.resolve(__dirname, "../share-tour.html"), "utf8");
const match = html.match(/<script>([\s\S]+?)<\/script>/);
assert.ok(match, "inline shared-tour script must exist");
const script = match[1];

function load(query, options = {}) {
  const elements = Object.fromEntries(
    ["tour-frame", "tour-title", "empty", "feedback", "share"].map(id => [
      id, {
        id, hidden: id === "tour-frame", disabled: id === "share",
        textContent: "", src: "", handlers: {},
        addEventListener(event, handler) { this.handlers[event] = handler; }
      }
    ])
  );
  let copied = null;
  let nativeShared = null;
  const location = new URL(
    (options.file ? "file:///tmp/" : "https://example.test/") + "share-tour.html" + query
  );
  const navigator = {
    clipboard: { async writeText(value) { copied = value; } },
    ...(options.nativeShare ? { share: async data => { nativeShared = data; } } : {})
  };
  const document = {
    title: "REEVA",
    getElementById: id => elements[id],
    createElement: () => ({
      style: {}, select() {}, remove() {}, set value(v) { this.saved = v; }
    }),
    execCommand: () => true,
    body: { appendChild() {} }
  };
  const window = { location, isSecureContext: true };
  vm.runInNewContext(script, {
    window, navigator, document, URL, URLSearchParams, encodeURIComponent, console, Object
  }, { timeout: 1000 });

  return {
    elements, document,
    clickShare: async () => {
      const callback = elements.share.handlers.click;
      if (callback) await callback();
    },
    get copied() { return copied; },
    get nativeShared() { return nativeShared; }
  };
}

(async () => {
  const tests = [];
  function check(name, fn) {
    try { fn(); tests.push({ name, pass: true }); }
    catch (err) { tests.push({ name, pass: false, error: err.message }); }
  }

  const valid = load("?house=A28&utm_source=example#fragment");
  check("A28 loads original Marzipano", () =>
    assert.equal(valid.elements["tour-frame"].src, "tours/A28/app-files/index.html"));
  check("A28 iframe visible; sharing enabled", () => {
    assert.equal(valid.elements["tour-frame"].hidden, false);
    assert.equal(valid.elements.share.disabled, false);
  });
  await valid.clickShare();
  check("copy link removes tracking and fragment", () =>
    assert.equal(valid.copied, "https://example.test/share-tour.html?house=A28"));

  const native = load("?house=a28", { nativeShare: true });
  await native.clickShare();
  check("native share uses canonical house code", () =>
    assert.equal(native.nativeShared.url, "https://example.test/share-tour.html?house=A28"));

  for (const query of ["", "?house=A29", "?house=__proto__", "?house=constructor", "?house=../A28", "?house=%3Cscript%3E"]) {
    const invalid = load(query);
    check("reject invalid house " + (query || "(missing)"), () => {
      assert.equal(invalid.elements["tour-frame"].hidden, true);
      assert.equal(invalid.elements.share.disabled, true);
      assert.ok(invalid.elements.empty.textContent.includes("ไม่พบ Virtual Tour"));
    });
  }

  const localFile = load("?house=A28", { file: true });
  check("file protocol cannot be shared", () =>
    assert.equal(localFile.elements.share.disabled, true));

  const failed = tests.filter(x => !x.pass);
  for (const row of tests) console.log((row.pass ? "PASS " : "FAIL ") + row.name + (row.error ? ": " + row.error : ""));
  console.log("RESULT:", tests.length - failed.length + "/" + tests.length);
  if (failed.length) process.exitCode = 1;
})().catch(err => { console.error(err); process.exitCode = 1; });
