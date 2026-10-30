import type { Metadata } from "next";
import AuthPage from "@/components/site/AuthPage";
import AuthCard from "@/components/site/AuthCard";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <AuthPage>
      <AuthCard initialMode="in" />
    </AuthPage>
  );
}
