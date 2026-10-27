import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ThemeControl } from "@/components/theme-control";
import { parseTheme, THEME_COOKIE } from "@/lib/theme";

// Repository parsing and after() work stay within the free Hobby runtime limit.
export const maxDuration = 300;

// Everything inside the app renders within this shell, always under an
// active organization. No organization yet means first sign-in: /start
// resolves one before the workspace is shown.
export default async function WorkspaceLayout({ children }: LayoutProps<"/">) {
  const { orgId } = await auth();
  if (!orgId) redirect("/start");

  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <header className="flex min-h-16 shrink-0 flex-wrap items-center gap-x-5 gap-y-3 border-b border-line bg-surface px-4 py-3 sm:px-7 md:flex-nowrap">
        <Link href="/" aria-label="Cartograph dashboard" className="flex shrink-0 items-center gap-2.5 text-base font-semibold tracking-tight hover:text-accent"><BrandMark /><span>cartograph<span className="text-accent">.</span></span></Link>
        <span className="hidden h-6 w-px bg-line sm:block" aria-hidden="true" />
        <OrganizationSwitcher
          hidePersonal
          afterSelectOrganizationUrl="/"
          afterCreateOrganizationUrl="/"
          afterLeaveOrganizationUrl="/start"
        />
        <div className="ml-auto flex shrink-0 items-center gap-3">
          <span className="hidden items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-[10px] font-medium text-fg-muted lg:inline-flex"><span className="size-1.5 rounded-full bg-incoming" />Free AI</span>
          <ThemeControl initial={theme} />
          <UserButton />
        </div>
      </header>
      <main className="min-h-0 min-w-0 flex-1">{children}</main>
    </div>
  );
}
