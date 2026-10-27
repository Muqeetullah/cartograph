export function AuthFormLoading({ mode }: { mode: "sign-in" | "sign-up" }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className="flex min-h-[420px] flex-col items-center justify-center px-4 text-center">
      <svg viewBox="0 0 32 32" fill="none" className="size-8 text-accent motion-safe:animate-spin" aria-hidden="true">
        <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2.5" opacity=".2" />
        <path d="M16 4a12 12 0 0 1 12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <p className="mt-5 text-sm font-medium text-fg">{mode === "sign-up" ? "Preparing your sign-up form" : "Preparing your sign-in form"}</p>
      <p className="mt-2 text-xs text-fg-muted">Just a moment…</p>
    </div>
  );
}
