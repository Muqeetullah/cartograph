import { STAGES, STALE_AFTER_MS, type Progress } from "./stages.ts";

export type StepState = "done" | "current" | "failed" | "stale" | "pending";
const DESCRIPTIONS = {
  fetch: "Resolve the commit and download the repository source.",
  select: "Find the JavaScript and TypeScript files to analyze.",
  parse: "Read imports and resolve connections between files.",
  store: "Save the dependency map to your workspace.",
};

export function progressView(progress: Progress, staleAtRender: boolean) {
  const failed = progress.status === "failed";
  const complete = progress.status === "complete";
  const stale = staleAtRender && (progress.status === "running" || progress.status === "queued");
  const unavailable = failed && progress.stage === "fetch" && /doesn't exist on GitHub|isn't public/i.test(progress.message ?? "");
  const rateLimited = failed && /rate limit/i.test(progress.message ?? "");
  const current = STAGES.findIndex(({ stage }) => stage === progress.stage);
  const steps = STAGES.map(({ stage, label }, index) => {
    let state: StepState = "pending";
    if (complete) state = "done";
    else if (progress.status !== "queued" && current !== -1 && index <= current) {
      state = index < current ? "done" : failed ? "failed" : stale ? "stale" : "current";
    }
    return { stage, label, description: DESCRIPTIONS[stage], state };
  });

  const title = complete ? "Your map is ready" : unavailable ? "We couldn’t access this repository" : rateLimited ? "GitHub needs a moment" : failed ? "This analysis couldn’t finish" : stale ? "This analysis stopped updating" : progress.status === "queued" ? "Your analysis is queued" : "Mapping your repository";
  const description = complete ? "Your files and their connections are saved. Opening the map…" : unavailable ? "Cartograph analyzes public GitHub repositories. This repository may be private, renamed, or unavailable." : rateLimited ? "GitHub’s free request limit has been reached. Wait for it to reset, then try again." : failed ? "The run stopped before the map was ready. Review the details below, then retry or choose another repository." : stale ? `There has been no progress for over ${STALE_AFTER_MS / 60000} minutes. The process may have stopped; you can start a fresh run.` : progress.status === "queued" ? "Your repository has been submitted. The pipeline will start by fetching its source." : "Reading the source and connecting the dots. Your map is built from actual imports, one step at a time.";

  return { failed, complete, stale, unavailable, title, description, steps, completed: steps.filter(({ state }) => state === "done").length, canRerun: failed || stale || complete };
}
