import type { Metadata } from "next";
import AuthPage from "@/components/site/AuthPage";
import ResetCard from "@/components/site/ResetCard";

export const metadata: Metadata = { title: "New password" };

export default function ResetPasswordPage() {
  return (
    <AuthPage>
      <ResetCard />
    </AuthPage>
  );
}
