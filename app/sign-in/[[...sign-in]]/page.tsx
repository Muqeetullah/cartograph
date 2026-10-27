import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";
import { AuthFormLoading } from "@/components/auth-form-loading";
import { AuthShell } from "@/components/auth-shell";

export const metadata: Metadata = { title: "Welcome back · Cartograph" };

export default function SignInPage() {
  return <AuthShell mode="sign-in"><SignIn fallback={<AuthFormLoading mode="sign-in" />} /></AuthShell>;
}
