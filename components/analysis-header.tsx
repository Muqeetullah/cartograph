"use client";

import Link from "next/link";
import { RepositoryIcon } from "./brand-mark";
import { useRouter } from "next/navigation";
import { RerunButton } from "./progress/rerun-button";

// Above the shell, not in it: the map's columns stay where they are. Re-running
// hands the page back to the progress view, which the server renders once the
// row says running.
export function AnalysisHeader({ analysisId, repository, commitSha }: { analysisId: string; repository: { owner: string; name: string }; commitSha: string }) {
  const router = useRouter();
  return (
    <div className="flex min-h-14 shrink-0 items-center gap-3 border-b border-line bg-surface px-4 text-xs sm:px-6">
      <Link href="/" className="shrink-0 text-fg-muted hover:text-fg" aria-label="Back to dashboard">←</Link>
      <RepositoryIcon className="hidden size-4 shrink-0 text-fg-muted sm:block" />
      <h1 className="min-w-0 truncate font-mono text-sm" title={`${repository.owner}/${repository.name}`}>
        <span className="text-fg-muted">{repository.owner}/</span>
        {repository.name}
      </h1>
      <span className="hidden shrink-0 rounded-md border border-line bg-canvas px-2 py-1 font-mono text-[10px] text-fg-muted sm:inline" title={commitSha}>
        {commitSha.slice(0, 7)}
      </span>
      <span className="ml-auto shrink-0">
        <RerunButton analysisId={analysisId} onStarted={() => router.refresh()} />
      </span>
    </div>
  );
}
