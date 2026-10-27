"use client";

import Link from "next/link";
import { RepositoryIcon } from "../brand-mark";
import { StateMark } from "@/components/state-mark";
import { STALE_AFTER_MS, type Progress } from "@/lib/pipeline/stages";
import { sameProgress, useProgress } from "./use-progress";

export type RowData = {
  id: string;
  repository: { owner: string; name: string } | null;
  commitSha: string | null;
  progress: Progress;
  staleAtRender: boolean;
  // Formatted by the server, so the browser renders the same text it was sent.
  created: { iso: string; ago: string };
  finished: { iso: string; ago: string } | null;
};

// One dashboard row. An unfinished one follows its own channel, so a run
// started in another tab moves here too.
export function AnalysisRow({ row }: { row: RowData }) {
  const { progress } = useProgress(row.id, row.progress);
  const stale = row.staleAtRender && sameProgress(progress, row.progress);
  const finishedNow = !row.finished && (progress.status === "complete" || progress.status === "failed");
  const note = progress.status === "complete" ? null : progress.message;

  return (
    <tr className="group border-b border-line align-middle hover:bg-raised/60">
      <td className="min-w-0 px-5 py-5 font-mono">
        <Link href={`/analyses/${row.id}`} className="flex min-w-0 items-center gap-3" title={row.repository ? `${row.repository.owner}/${row.repository.name}` : undefined}>
          <span className="hidden size-9 shrink-0 items-center justify-center rounded-lg border border-line bg-canvas text-fg-muted sm:inline-flex"><RepositoryIcon className="size-4" /></span>
          <span className="min-w-0 truncate">{row.repository ? (
            <>
              <span className="text-fg-muted">{row.repository.owner}/</span>
              {row.repository.name}
            </>
          ) : (
            <span className="text-fg-muted">—</span>
          )}
          </span>
          {note && (
            <span className="mt-0.5 block truncate font-sans text-fg-muted" title={note}>
              {stale ? `No progress for over ${STALE_AFTER_MS / 60000} minutes — ${note}` : note}
            </span>
          )}
        </Link>
      </td>
      <td className="px-3 py-5">
        <span className={`inline-flex flex-wrap items-center gap-1.5 rounded-full border border-line bg-canvas px-2.5 py-1 text-[10px] capitalize ${progress.status === "complete" ? "text-incoming" : "text-fg-muted"}`}>
          <StateMark status={progress.status} stale={stale} />
          {stale ? "stale" : progress.status}
          {progress.status === "running" && !stale && progress.stage && (
            <span className="text-fg-muted">· {progress.stage}</span>
          )}
        </span>
      </td>
      <td className="hidden px-3 py-5 font-mono text-[11px] text-fg-muted lg:table-cell">
        {row.commitSha ? <span title={row.commitSha}>{row.commitSha.slice(0, 7)}</span> : "—"}
      </td>
      <td className="hidden px-3 py-5 text-right text-fg-muted tabular-nums sm:table-cell">
        <time dateTime={row.created.iso} title={row.created.iso}>
          {row.created.ago}
        </time>
      </td>
      <td className="hidden px-5 py-5 text-right text-fg-muted tabular-nums lg:table-cell">
        {row.finished ? (
          <time dateTime={row.finished.iso} title={row.finished.iso}>
            {row.finished.ago}
          </time>
        ) : finishedNow ? (
          "just now"
        ) : (
          "—"
        )}
      </td>
    </tr>
  );
}
