import PageHeader from "@/components/ui/PageHeader";
import SprintView from "@/components/sprint/SprintView";

export const metadata = { title: "Triage sprint" };

export default function SprintPage() {
  return (
    <>
      <PageHeader
        back={{ href: "/practice", label: "Practice and learn" }}
        title="Triage sprint"
        description="A noisy day in one page: decide quickly what to close, look at, or escalate."
      />
      <SprintView />
    </>
  );
}
