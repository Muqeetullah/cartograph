import { ArrowRight, BrandMark, RepositoryIcon } from "@/components/brand-mark";
import { auth } from "@clerk/nextjs/server";
import { connection } from "next/server";
import { AnalysisRow, type RowData } from "@/components/progress/analysis-row";
import { StateMark } from "@/components/state-mark";
import { SubmitForm } from "@/components/submit-form";
import { isStale, type Status } from "@/lib/pipeline/stages";
import { createServerSupabase } from "@/lib/supabase/server";
import { ago } from "@/lib/time";

const LIST_LIMIT = 100;
type Tally = Status | "stale";
const TALLY_ORDER: Tally[] = ["running", "queued", "stale", "complete", "failed"];

export default async function DashboardPage() {
  const { sessionClaims } = await auth();

  // Read off the token, never fetched from Clerk. If the claim is missing the
  // session token hasn't been customised yet, and that should be obvious.
  const orgName = sessionClaims?.org_name;
  if (!orgName) {
    throw new Error(
      'Session token has no org_name claim. Add "org_name": "{{org.name}}" in Clerk → Sessions → Customize session token.',
    );
  }

  const rows = await loadRows();

  const counts = new Map<Tally, number>();
  for (const r of rows) {
    const tally: Tally = r.staleAtRender ? "stale" : r.progress.status;
    counts.set(tally, (counts.get(tally) ?? 0) + 1);
  }

  const complete = counts.get("complete") ?? 0;
  const active = (counts.get("running") ?? 0) + (counts.get("queued") ?? 0);

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-8 sm:py-10 lg:py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-fg-muted">Your workspace</p>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">A clearer view of your code.</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-fg-muted">Explore dependencies, trace the impact of a change, and make sense of any repository.</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-[11px] text-fg-muted">
            <span className="size-1.5 rounded-full bg-incoming" />{String(orgName)}
          </span>
        </div>

        <section aria-labelledby="new-analysis-heading" className="rounded-2xl border border-line bg-surface p-5 shadow-[0_2px_8px_#00000003] sm:p-7">
          <div className="mb-5 flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent"><RepositoryIcon /></span>
            <div>
              <h2 id="new-analysis-heading" className="text-base font-semibold tracking-tight">Map a repository</h2>
              <p className="mt-1 text-xs leading-5 text-fg-muted">Start with a public GitHub URL. We’ll map the code, import by import.</p>
            </div>
          </div>
          <SubmitForm />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-fg-muted">
            <span>TypeScript & JavaScript <span className="mx-1.5 text-line">/</span> Public repositories</span>
            <span className="inline-flex items-center gap-1.5"><span className="size-1 rounded-full bg-accent" />Real code. Real connections.</span>
          </div>
        </section>

        <div className="my-7 grid grid-cols-3 gap-3 sm:gap-5">
          {[{ label: "Repositories mapped", value: rows.length, caption: "In this workspace" }, { label: "Ready to explore", value: complete, caption: "Completed analyses" }, { label: "In progress", value: active, caption: "Queued or running" }].map((item) => (
            <div key={item.label} className="rounded-xl border border-line bg-surface px-3 py-4 sm:px-5 sm:py-5">
              <p className="text-[10px] font-medium text-fg-muted sm:text-xs">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">{item.value}</p>
              <p className="mt-2 hidden text-[11px] text-fg-muted sm:block">{item.caption}</p>
            </div>
          ))}
        </div>

        <section aria-labelledby="recent-analyses-heading" className="overflow-hidden rounded-2xl border border-line bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
            <div className="flex items-center gap-2.5">
              <h2 id="recent-analyses-heading" className="text-sm font-semibold">Your analyses</h2>
              <span className="rounded-md bg-raised px-2 py-0.5 text-[10px] text-fg-muted tabular-nums">{rows.length}</span>
            </div>
            <span className="text-[11px] text-fg-muted">{rows.length === LIST_LIMIT ? "Latest 100" : "Most recent first"}</span>
          </div>
          {rows.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-14 text-center">
              <BrandMark className="mb-4 size-11 opacity-70" />
              <h3 className="text-sm font-medium">Your next discovery starts here.</h3>
              <p className="mt-2 max-w-xs text-xs leading-5 text-fg-muted">Add a repository above to turn its files and imports into a map you can explore.</p>
              <a href="#repository-url" className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-accent">Map your first repository <ArrowRight /></a>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="analysis-table w-full table-fixed border-collapse text-xs">
                <colgroup>
                  <col />
                  <col className="w-28 sm:w-36" />
                  <col className="hidden w-24 lg:table-column" />
                  <col className="hidden w-24 sm:table-column" />
                  <col className="hidden w-24 lg:table-column" />
                </colgroup>
                <thead className="bg-canvas/70 text-left text-[10px] uppercase tracking-[0.08em] text-fg-muted">
                  <tr className="h-10 border-b border-line">
                    <th className="px-5 font-medium">Repository</th>
                    <th className="px-3 font-medium">Status</th>
                    <th className="hidden px-3 font-medium lg:table-cell">Commit</th>
                    <th className="hidden px-3 text-right font-medium sm:table-cell">Started</th>
                    <th className="hidden px-5 text-right font-medium lg:table-cell">Finished</th>
                  </tr>
                </thead>
                <tbody>{rows.map((row) => <AnalysisRow key={row.id} row={row} />)}</tbody>
              </table>
            </div>
          )}
          {rows.length > 0 && (
            <div className="flex flex-wrap items-center gap-4 border-t border-line px-5 py-3 text-[10px] text-fg-muted">
              {TALLY_ORDER.filter((status) => counts.has(status)).map((status) => <span key={status} className="inline-flex items-center gap-1.5"><StateMark status={status === "stale" ? "running" : status} stale={status === "stale"} />{counts.get(status)} {status}</span>)}
              <span className="ml-auto hidden sm:inline">Built from the source, not guesswork.</span>
            </div>
          )}
        </section>
        <p className="mt-6 text-center text-[10px] text-fg-muted">Structure from the code. Explanations from free AI.</p>
      </div>
    </div>
  );
}

// Loaded before rendering, and the clock read here: stale and "3m ago" are
// facts about the moment of the request, worked out once. Nothing ticks in
// the browser.
async function loadRows(): Promise<RowData[]> {
  // No organization filter: the row policy scopes this to the organization on
  // the token. Switching organization changes the token, not this query.
  const supabase = await createServerSupabase();
  const { data: analyses, error } = await supabase
    .from("analyses")
    .select("id, status, stage, stage_message, commit_sha, error, created_at, started_at, finished_at, projects(repo_owner, repo_name)")
    .order("created_at", { ascending: false })
    .limit(LIST_LIMIT);
  if (error) throw new Error(`Couldn't load analyses: ${error.message}`);

  await connection();
  const now = Date.now();
  return analyses.map((a) => ({
    id: a.id,
    repository: a.projects ? { owner: a.projects.repo_owner, name: a.projects.repo_name } : null,
    commitSha: a.commit_sha,
    progress: { status: a.status, stage: a.stage, message: a.status === "failed" ? a.error : a.stage_message },
    staleAtRender: isStale(a, now),
    created: { iso: a.created_at, ago: ago(a.created_at, now) },
    finished: a.finished_at ? { iso: a.finished_at, ago: ago(a.finished_at, now) } : null,
  }));
}
