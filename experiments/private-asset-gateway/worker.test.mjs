import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import worker from "./worker.mjs";

const token = "A".repeat(43);
const key = "token:" + createHash("sha256").update(token).digest("hex");
const path = "homes/EXAMPLE/index.html";

function makeEnv({enabled=true, consentConfirmed=true, prefix="homes/EXAMPLE/", data="<h1>Tour</h1>"} = {}) {
  let accessCount = 0;
  let objectCount = 0;
  const env = {
    TOUR_ACL: {
      async get(k, format) {
        accessCount++;
        assert.equal(format, "json");
        return k === key ? {enabled, consentConfirmed, prefix} : null;
      }
    },
    TOUR_TILES: {
      async get(k) {
        objectCount++;
        if (k !== path) return null;
        return {
          size: new TextEncoder().encode(data).byteLength,
          body: new Blob([data]).stream()
        };
      }
    }
  };
  return {env, counts:()=>({accessCount,objectCount})};
}
const route = "/t/" + token + "/index.html";
function request(pathname=route, method="GET") {
  return new Request("https://share.example.test" + pathname, {method});
}

test("valid link loads private HTML with no-store headers", async () => {
  const {env,counts}=makeEnv();
  const res=await worker.fetch(request(),env);
  assert.equal(res.status,200);
  assert.equal(await res.text(),"<h1>Tour</h1>");
  assert.equal(res.headers.get("content-type"),"text/html; charset=utf-8");
  assert.match(res.headers.get("cache-control"),/no-store/);
  assert.equal(counts().accessCount,1);
  assert.equal(counts().objectCount,1);
});
test("valid HEAD produces headers but no object body", async () => {
  const {env}=makeEnv();
  const res=await worker.fetch(request(route,"HEAD"),env);
  assert.equal(res.status,200);
  assert.equal(await res.text(),"");
});
test("unknown token is denied", async () => {
  const {env,counts}=makeEnv();
  const res=await worker.fetch(request("/t/"+"B".repeat(43)+"/index.html"),env);
  assert.equal(res.status,404);
  assert.equal(counts().objectCount,0);
});
test("disabled tour denies access",async()=>{
  const {env,counts}=makeEnv({enabled:false});
  assert.equal((await worker.fetch(request(),env)).status,404);
  assert.equal(counts().objectCount,0);
});
test("no consent denies access",async()=>{
  const {env}=makeEnv({consentConfirmed:false});
  assert.equal((await worker.fetch(request(),env)).status,404);
});
test("invalid R2 prefix denies access",async()=>{
  const {env}=makeEnv({prefix:"../other/"});
  assert.equal((await worker.fetch(request(),env)).status,404);
});
test("short token denies access",async()=>{
  const {env}=makeEnv();
  assert.equal((await worker.fetch(request("/t/short/index.html"),env)).status,404);
});
test("encoded slash in asset path denies access",async()=>{
  const {env}=makeEnv();
  assert.equal((await worker.fetch(request("/t/"+token+"/tiles%2Fsecret.jpg"),env)).status,404);
});
test("unlisted file extensions deny access",async()=>{
  const {env}=makeEnv();
  assert.equal((await worker.fetch(request("/t/"+token+"/config.env"),env)).status,404);
});
test("POST denies access",async()=>{
  const {env}=makeEnv();
  assert.equal((await worker.fetch(request(route,"POST"),env)).status,404);
});
test("unknown object yields 404",async()=>{
  const {env}=makeEnv();
  assert.equal((await worker.fetch(request("/t/"+token+"/tiles/0/1/b/0/0.jpg"),env)).status,404);
});
test("missing bindings fail closed",async()=>{
  assert.equal((await worker.fetch(request(),{})).status,503);
});

test("tiles require the same valid token as the HTML",async()=>{
  const {env,counts}=makeEnv();
  const res=await worker.fetch(request("/t/"+token+"/tiles/0/1/f/0/0.jpg"),env);
  assert.equal(res.status,404);
  assert.equal(counts().accessCount,1);
  assert.equal(counts().objectCount,1);
});
test("revoking token blocks HTML and all tile requests",async()=>{
  const {env,counts}=makeEnv({enabled:false});
  for (const path of [route,"/t/"+token+"/tiles/0/1/f/0/0.jpg"]) {
    assert.equal((await worker.fetch(request(path),env)).status,404);
  }
  assert.equal(counts().objectCount,0);
});
test("path traversal segments are rejected before R2",async()=>{
  const {env,counts}=makeEnv();
  const res=await worker.fetch(request("/t/"+token+"/%2e%2e/secret.jpg"),env);
  assert.equal(res.status,404);
  assert.equal(counts().objectCount,0);
});
test("double-encoded path characters are rejected before R2",async()=>{
  const {env,counts}=makeEnv();
  const res=await worker.fetch(request("/t/"+token+"/tiles%252Fsecret.jpg"),env);
  assert.equal(res.status,404);
  assert.equal(counts().objectCount,0);
});
test("consent must be the boolean true (not a string)",async()=>{
  const {env,counts}=makeEnv({consentConfirmed:"true"});
  assert.equal((await worker.fetch(request(),env)).status,404);
  assert.equal(counts().objectCount,0);
});
test("a malformed namespace prefix cannot read unrelated houses",async()=>{
  const {env,counts}=makeEnv({prefix:"homes/EXAMPLE/../OTHER/"});
  assert.equal((await worker.fetch(request(),env)).status,404);
  assert.equal(counts().objectCount,0);
});
