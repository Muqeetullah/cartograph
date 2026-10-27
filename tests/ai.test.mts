import assert from "node:assert/strict";
import { after, test } from "node:test";

process.env.OPENROUTER_API_KEY = "test-key";
process.env.LANGSMITH_TRACING = "false";
const { completeFree, MODELS } = await import("../lib/ai/client.ts");
const { classifyFile, explainFile, cacheKey } = await import("../lib/ai/tasks.ts");
const originalFetch = globalThis.fetch;
let requests: Record<string, unknown>[] = [];
let replies: { status?: number; content?: string | null }[] = [];

globalThis.fetch = async (_url, init) => {
  requests.push(JSON.parse(String(init?.body)));
  const reply = replies.shift();
  assert.ok(reply, "Unexpected API request (possibly an unwanted retry)");
  const status = reply.status ?? 200;
  return new Response(JSON.stringify(status === 200 ? {
    id: "test-completion", object: "chat.completion", created: 0,
    model: MODELS.explain,
    choices: [{ index: 0, finish_reason: "stop", message: { role: "assistant", content: reply.content } }],
  } : { error: { message: "Provider returned error", code: status } }), {
    status, headers: { "content-type": "application/json" },
  });
};
after(() => { globalThis.fetch = originalFetch; });

function setup(next: typeof replies) { requests = []; replies = [...next]; }
function memoryCache() {
  const entries = new Map<string, string>();
  return { entries, read: async (key: string) => entries.get(key) ?? null,
    write: async ({ key, body }: { key: string; body: string }) => { entries.set(key, body); } };
}
const input = { path: "src/add.ts", hash: "v1", exports: ["add"], imports: [], importedBy: [] };
const source = async () => "export const add = (a: number, b: number) => a + b;";

test("paid models are rejected before a request is sent", async () => {
  setup([]);
  await assert.rejects(completeFree({ model: "openai/gpt-4.1", messages: [] }), /Only the configured free/);
  assert.equal(requests.length, 0);
});

test("explanations use the coding model with zero-price routing and a new cache identity", async () => {
  setup([{ content: "`src/add.ts` exports a function that adds two numbers." }]);
  const cache = memoryCache();
  const result = await explainFile({ ...input, role: "util", reachedBy: null }, { cache, source });
  assert.match(result.body, /adds two numbers/);
  assert.equal(result.model, "poolside/laguna-s-2.1:free");
  assert.notEqual(cacheKey("explain-file", result.model, input), cacheKey("explain-file", "openrouter/free", input));
  assert.deepEqual(requests[0].provider, { max_price: { prompt: 0, completion: 0 } });
  assert.equal(requests[0].max_tokens, 2048);
});

test("classification validates the role and serves the next request from cache", async () => {
  setup([{ content: '{"role":"util"}' }]);
  const cache = memoryCache();
  assert.deepEqual(await classifyFile(input, { cache, source }), { role: "util", cached: false });
  assert.deepEqual(await classifyFile(input, { cache, source: async () => { throw Error("Must not fetch source"); } }), { role: "util", cached: true });
  assert.equal(requests.length, 1);
});

test("invalid classifications and empty explanations never enter the cache", async () => {
  setup([{ content: '{"role":"admin"}' }, { content: null }]);
  const cache = memoryCache();
  await assert.rejects(classifyFile(input, { cache, source }), /isn't allowed/);
  await assert.rejects(explainFile({ ...input, role: "util", reachedBy: null }, { cache, source }), /empty answer/);
  assert.equal(cache.entries.size, 0);
});

test("a free-provider rate limit gives a clear error with no automatic retries", async () => {
  setup([{ status: 429 }]);
  await assert.rejects(completeFree({ model: MODELS.explain, messages: [] }), /free request limit.*No paid model/);
  assert.equal(requests.length, 1);
});
