import assert from "node:assert/strict";
import { test } from "node:test";
import { progressView } from "../lib/pipeline/progress-view.ts";

test("a private or missing repository gives useful recovery guidance", () => {
  const view = progressView({ status: "failed", stage: "fetch", message: "muqeetullah/cartograph doesn't exist on GitHub, or it isn't public" }, false);
  assert.equal(view.unavailable, true);
  assert.match(view.title, /access this repository/);
  assert.match(view.description, /public GitHub repositories/);
  assert.deepEqual(view.steps.map(s => s.state), ["failed", "pending", "pending", "pending"]);
  assert.equal(view.completed, 0);
  assert.equal(view.canRerun, true);
});

test("running analysis marks only earlier stages complete", () => {
  const view = progressView({ status: "running", stage: "parse", message: "Parsing 90 files" }, false);
  assert.equal(view.title, "Mapping your repository");
  assert.deepEqual(view.steps.map(s => s.state), ["done", "done", "current", "pending"]);
  assert.equal(view.completed, 2);
  assert.equal(view.canRerun, false);
});

test("queued and completed analyses do not invent intermediate progress", () => {
  const queued = progressView({ status: "queued", stage: null, message: null }, false);
  assert.ok(queued.steps.every(s => s.state === "pending"));
  assert.equal(queued.completed, 0);
  const ready = progressView({ status: "complete", stage: "store", message: "Stored" }, true);
  assert.ok(ready.steps.every(s => s.state === "done"));
  assert.equal(ready.completed, 4);
  assert.equal(ready.stale, false);
});

test("stale state is limited to unfinished runs and clears after restart", () => {
  const stale = progressView({ status: "running", stage: "select", message: null }, true);
  assert.equal(stale.stale, true);
  assert.deepEqual(stale.steps.map(s => s.state), ["done", "stale", "pending", "pending"]);
  assert.equal(stale.canRerun, true);
  const restarted = progressView({ status: "running", stage: "fetch", message: "Starting" }, false);
  assert.equal(restarted.stale, false);
  assert.equal(restarted.canRerun, false);
  const failed = progressView({ status: "failed", stage: "select", message: "Error" }, true);
  assert.equal(failed.stale, false);
  assert.equal(failed.steps[1].state, "failed");
});

test("rate limits get different guidance and unknown failures stay honest", () => {
  const limited = progressView({ status: "failed", stage: "fetch", message: "GitHub's unauthenticated rate limit is used up" }, false);
  assert.match(limited.description, /Wait for it to reset/);
  assert.equal(limited.unavailable, false);
  const unknown = progressView({ status: "failed", stage: null, message: "Unexpected failure" }, false);
  assert.equal(unknown.completed, 0);
  assert.ok(unknown.steps.every(s => s.state === "pending"));
  assert.equal(unknown.title, "This analysis couldn’t finish");
});
