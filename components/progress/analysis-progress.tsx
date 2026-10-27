"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowRight, RepositoryIcon } from "@/components/brand-mark";
import { progressView, type StepState } from "@/lib/pipeline/progress-view";
import type { Progress } from "@/lib/pipeline/stages";
import { RerunButton } from "./rerun-button";
import { sameProgress, useProgress } from "./use-progress";

type Props = {
  analysisId: string;
  repository: { owner: string; name: string };
  commitSha: string | null;
  initial: Progress;
  staleAtRender: boolean;
  started: { iso: string; ago: string } | null;
};

const STEP_LABELS: Record<StepState, string> = { done: "Complete", current: "In progress", failed: "Stopped here", stale: "No updates", pending: "Waiting" };

export function AnalysisProgress({ analysisId, repository, commitSha, initial, staleAtRender, started }: Props) {
  const { progress, lost, restarted } = useProgress(analysisId, initial);
  const router = useRouter();
  const view = progressView(progress, staleAtRender && sameProgress(progress, initial));
  useEffect(() => { if (view.complete) router.refresh(); }, [view.complete, router]);
  const warning = view.failed || view.stale;
  const repositoryName = `${repository.owner}/${repository.name}`;

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-4xl px-4 py-7 sm:px-8 sm:py-10">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3 text-xs">
          <Link href="/" className="inline-flex items-center gap-2 font-medium text-fg-muted hover:text-fg"><span aria-hidden="true">←</span>All analyses</Link>
          <span className="inline-flex min-w-0 max-w-full items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-fg-muted"><RepositoryIcon className="size-3.5 shrink-0" /><span className="truncate font-mono" title={repositoryName}>{repositoryName}</span></span>
        </div>

        <section aria-labelledby="analysis-status-title" className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_2px_8px_#00000003]">
          <div className="p-5 sm:p-8">
            <div className={`mb-5 flex size-12 items-center justify-center rounded-2xl ${warning ? "bg-outgoing/10 text-outgoing" : "bg-accent/10 text-accent"}`}><StatusIcon state={warning ? "warning" : view.complete ? "complete" : "working"} /></div>
            <div role="status" aria-live="polite">
              <p className={`mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] ${warning ? "text-outgoing" : "text-accent"}`}>{view.failed ? "Analysis failed" : view.stale ? "Analysis interrupted" : view.complete ? "Analysis complete" : "Analysis in progress"}</p>
              <h1 id="analysis-status-title" className="text-2xl leading-tight font-semibold tracking-[-0.035em] sm:text-3xl">{view.title}</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-fg-muted">{view.description}</p>
            </div>
            {view.failed && progress.message && (
              <div className="mt-6 rounded-xl border border-line bg-canvas px-4 py-3.5">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-fg-muted">Error details</p>
                <p className="break-words font-mono text-xs leading-6 text-fg">{progress.message}</p>
              </div>
            )}
            {started && <p className="mt-5 text-[11px] text-fg-muted">Started <time dateTime={started.iso} title={started.iso}>{started.ago}</time>{commitSha && <> <span className="mx-1.5 text-line">/</span> Commit <span className="font-mono" title={commitSha}>{commitSha.slice(0, 7)}</span></>}</p>}
          </div>
          {(view.failed || view.stale) && (
            <div className="flex flex-wrap items-center gap-3 border-t border-line bg-canvas/40 px-5 py-5 sm:px-8">
              <Link href="/" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-xs font-medium text-accent-fg hover:opacity-90">Choose another repository<ArrowRight className="size-3.5" /></Link>
              <RerunButton analysisId={analysisId} label="Try again" onStarted={restarted} />
              <a href={`https://github.com/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.name)}`} target="_blank" rel="noopener noreferrer" className="py-2 text-xs text-fg-muted hover:text-fg sm:ml-auto">View on GitHub <span aria-hidden="true">↗</span></a>
            </div>
          )}
        </section>

        <section aria-labelledby="pipeline-heading" className="mt-6 overflow-hidden rounded-2xl border border-line bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-4 sm:px-6">
            <h2 id="pipeline-heading" className="text-sm font-semibold">Analysis pipeline</h2>
            <span className="text-[11px] text-fg-muted">{view.completed} of {view.steps.length} steps complete</span>
          </div>
          <ol className="divide-y divide-line">
            {view.steps.map(({ stage, label, description, state }, index) => (
              <li key={stage} aria-current={state === "current" ? "step" : undefined} className={`flex items-start gap-3 px-5 py-4 sm:gap-4 sm:px-6 ${state === "current" ? "bg-accent/5" : ""}`}>
                <span className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-medium ${state === "failed" || state === "stale" ? "border-outgoing/25 bg-outgoing/10 text-outgoing" : state === "done" ? "border-incoming/25 bg-incoming/10 text-incoming" : state === "current" ? "border-accent/30 bg-accent/10 text-accent" : "border-line bg-canvas text-fg-muted"}`}><StepMark state={state} index={index} /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <h3 className={`text-xs font-medium ${state === "pending" ? "text-fg-muted" : "text-fg"}`}>{label}</h3>
                    <span className={`text-[10px] ${state === "failed" || state === "stale" ? "text-outgoing" : state === "done" ? "text-incoming" : "text-fg-muted"}`}>{STEP_LABELS[state]}</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-5 text-fg-muted">{state === "current" && progress.message ? progress.message : description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {lost && <div role="alert" className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface px-5 py-4"><p className="min-w-0 flex-1 break-words text-xs leading-5 text-fg-muted">Live updates disconnected: {lost}. Refresh to check the latest status.</p><button type="button" onClick={() => router.refresh()} className="rounded-lg border border-line px-3 py-2 text-xs font-medium hover:bg-raised">Refresh status</button></div>}
        <p className="mt-6 text-center text-[10px] leading-5 text-fg-muted">Only public repositories are supported. Source code is read, never executed.</p>
      </div>
    </div>
  );
}

function StatusIcon({ state }: { state: "warning" | "complete" | "working" }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">{state === "warning" ? <><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5m0 3h.01" /></> : state === "complete" ? <><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></> : <><rect x="3" y="3" width="6" height="6" rx="1.5" /><rect x="15" y="15" width="6" height="6" rx="1.5" /><path d="M9 6h6a3 3 0 0 1 3 3v6M6 9v6a3 3 0 0 0 3 3h6" /></>}</svg>;
}

function StepMark({ state, index }: { state: StepState; index: number }) {
  if (state === "done") return <span aria-hidden="true">✓</span>;
  if (state === "failed" || state === "stale") return <span aria-hidden="true">!</span>;
  if (state === "current") return <svg viewBox="0 0 20 20" className="size-4 motion-safe:animate-spin" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="10" cy="10" r="7" opacity=".2" /><path d="M10 3a7 7 0 0 1 7 7" strokeLinecap="round" /></svg>;
  return <span aria-hidden="true">{index + 1}</span>;
}
