import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";
import { AuthFormLoading } from "@/components/auth-form-loading";
import { AuthShell } from "@/components/auth-shell";

export const metadata: Metadata = { title: "Create your account · Cartograph" };

export default function SignUpPage() {
  return <AuthShell mode="sign-up"><SignUp fallback={<AuthFormLoading mode="sign-up" />} /></AuthShell>;
}
