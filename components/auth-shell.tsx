import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark } from "./brand-mark";

export function AuthShell({ children, mode }: { children: ReactNode; mode: "sign-up" | "sign-in" }) {
  return (
    <main className="grid min-h-dvh w-full flex-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <section aria-label="Discover Cartograph" className="relative hidden min-h-dvh overflow-hidden bg-[#0c0e14] text-[#e7eaf3] lg:flex lg:flex-col">
        <Image src="/images/cartograph-connections.webp" alt="" fill sizes="(min-width: 1024px) 52vw, 1px" className="object-cover" preload />
        <div className="absolute inset-0 bg-linear-to-b from-[#0c0e14]/75 via-transparent to-[#0c0e14]/95" />
        <div className="relative z-10 flex h-24 items-center px-10 xl:px-14">
          <Link href="/" aria-label="Cartograph dashboard" className="flex items-center gap-3 text-xl font-semibold tracking-tight"><BrandMark className="size-9" /><span>cartograph<span className="text-[#9ba7ff]">.</span></span></Link>
        </div>
        <div className="relative z-10 mt-auto px-10 pb-10 pt-72 xl:px-14 xl:pb-14">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] text-[#c1c8e3]"><span className="size-1.5 rounded-full bg-[#a4adff]" />A clearer view of your code</span>
          <h2 className="max-w-lg text-4xl leading-[1.12] font-semibold tracking-[-0.045em] xl:text-5xl">Every connection.<br /><span className="text-[#a4adff]">A little more clarity.</span></h2>
          <p className="mt-5 max-w-sm text-sm leading-7 text-[#a8b0c6]">Turn a repository into a map you can explore. Understand what connects, what depends on it, and where to go next.</p>
          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-6 text-[11px] text-[#b1b9d0]">
            {["Real code analysis", "Interactive maps", "Free AI explanations"].map((feature) => <span key={feature} className="inline-flex items-center gap-2"><svg viewBox="0 0 16 16" className="size-3.5 text-[#a4adff]" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m3 8 3 3 7-7" /></svg>{feature}</span>)}
          </div>
        </div>
      </section>

      <section aria-label={mode === "sign-up" ? "Create your account" : "Sign in to your account"} className="flex min-h-dvh min-w-0 items-center justify-center bg-canvas px-4 py-8 sm:px-8 sm:py-12">
        <div className="auth-form w-full max-w-[470px] rounded-2xl border border-line bg-surface p-6 shadow-[0_16px_64px_-24px_#00000040] sm:p-9">
          <div className="mb-7 flex items-center gap-2.5 text-sm font-semibold tracking-tight lg:hidden"><BrandMark className="size-7" /><span>cartograph<span className="text-accent">.</span></span></div>
          <p className="mb-6 text-[10px] font-medium uppercase tracking-[0.17em] text-accent">{mode === "sign-up" ? "Your next discovery starts here" : "Welcome back to your workspace"}</p>
          {children}
          <div className="mt-6 flex items-center justify-center gap-2 border-t border-line pt-5 text-[10px] text-fg-muted">
            <span className="size-1 rounded-full bg-accent" /><span>Free AI models. No paid fallback.</span>
          </div>
        </div>
      </section>
    </main>
  );
}
