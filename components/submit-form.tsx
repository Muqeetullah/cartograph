"use client";

import { ArrowRight } from "./brand-mark";
import { useActionState } from "react";
import { submitAnalysis, type FormState } from "@/app/(workspace)/actions";

const INITIAL: FormState = { error: null };

export function SubmitForm() {
  const [state, action, pending] = useActionState(submitAnalysis, INITIAL);
  return (
    <form action={action} className="flex w-full min-w-0 flex-wrap items-center gap-3">
      <input
        id="repository-url"
        name="url"
        required
        autoComplete="off"
        spellCheck={false}
        placeholder="https://github.com/owner/repository"
        aria-label="Public GitHub repository URL"
        aria-invalid={state.error ? true : undefined}
        aria-describedby={state.error ? "repository-url-error" : undefined}
        className="h-12 w-full min-w-0 flex-[1_1_20rem] rounded-xl border border-line bg-canvas px-4 font-mono text-xs outline-none placeholder:text-fg-muted/70 focus:border-accent focus:ring-3 focus:ring-accent/10"
      />
      <button
        type="submit"
        disabled={pending}
        className="flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-medium text-accent-fg shadow-sm hover:opacity-90 disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Starting…" : "Analyse repository"}
        {!pending && <ArrowRight />}
      </button>
      {state.error && (
        <span id="repository-url-error" role="alert" className="w-full break-words text-xs text-fg">
          {state.error}
        </span>
      )}
    </form>
  );
}
