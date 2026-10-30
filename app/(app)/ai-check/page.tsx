import PageHeader from "@/components/ui/PageHeader";
import AiCheckView from "@/components/aicheck/AiCheckView";

export const metadata = { title: "Spot the AI's mistake" };

export default function AiCheckPage() {
  return (
    <>
      <PageHeader
        back={{ href: "/practice", label: "Practice and learn" }}
        title="Spot the AI's mistake"
        description="Check an AI-written triage summary against the evidence before anyone acts on it."
      />
      <AiCheckView />
    </>
  );
}
