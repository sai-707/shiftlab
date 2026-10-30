import type { Metadata } from "next";
import AuthPage from "@/components/site/AuthPage";
import AuthCard from "@/components/site/AuthCard";

export const metadata: Metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <AuthPage>
      <AuthCard initialMode="up" />
    </AuthPage>
  );
}
