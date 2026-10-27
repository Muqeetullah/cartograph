import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { parseTheme, THEME_COOKIE } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cartograph",
  description: "Dependency maps of public GitHub repositories",
};

// Clerk's components read the same tokens as the app, so they follow the
// theme control instead of the OS.
const clerkAppearance = {
  variables: {
    colorBackground: "var(--cartograph-auth-surface)",
    colorForeground: "var(--cartograph-auth-fg)",
    colorMutedForeground: "var(--cartograph-auth-fg-muted)",
    colorPrimary: "var(--cartograph-auth-accent)",
    colorPrimaryForeground: "var(--cartograph-auth-accent-fg)",
    colorInput: "var(--cartograph-auth-canvas)",
    colorInputForeground: "var(--cartograph-auth-fg)",
    colorNeutral: "var(--cartograph-auth-fg)",
    colorBorder: "var(--cartograph-auth-line)",
    fontFamily: "var(--font-geist-sans)",
    fontSize: "0.8125rem",
    borderRadius: "0.25rem",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);

  return (
    <html
      lang="en"
      data-theme={theme}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex h-full flex-col">
        <ClerkProvider appearance={clerkAppearance}>{children}</ClerkProvider>
      </body>
    </html>
  );
}
