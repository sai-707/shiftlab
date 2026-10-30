import PageHeader from "@/components/ui/PageHeader";
import GlossaryView from "@/components/glossary/GlossaryView";

export const metadata = { title: "Glossary" };

export default function GlossaryPage() {
  return (
    <>
      <PageHeader
        back={{ href: "/practice", label: "Practice and learn" }}
        title="Glossary"
        description="Plain-English meanings for the words you will see in alerts, logs and playbooks."
      />
      <GlossaryView />
    </>
  );
}
