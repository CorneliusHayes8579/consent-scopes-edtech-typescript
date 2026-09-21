import assert from "node:assert/strict";
import { ConsentService } from "./consent_service.js";

const calls: Array<{ method: string; url: string; body?: BodyInit | null }> = [];
const originalFetch = globalThis.fetch;
globalThis.fetch = (async (input, init) => {
  calls.push({ method: init?.method ?? "", url: String(input), body: init?.body });
  return new Response(JSON.stringify({ ok: true, data: { result: false } }), { status: 200, headers: { "content-type": "application/json" } });
}) as typeof fetch;

process.env.INFRAI_API_KEY = "test-key";
const result = await new ConsentService().recordLesson({ learnerId: "learner-7", courseId: "algebra", deadline: "2026-10-01T09:00:00.000Z" });
assert.equal(result.consentGranted, true);
assert.deepEqual(calls.map((call) => call.method), ["GET", "POST"]);
assert.match(calls[0].url, /consent\/check\/learner-7\/course_reporting$/);
assert.deepEqual(JSON.parse(String(calls[1].body)), { category: "course_reporting" });
globalThis.fetch = originalFetch;
console.log("consent decision test passed");
