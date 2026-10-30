import PageHeader from "@/components/ui/PageHeader";
import ToolsView from "@/components/tools/ToolsView";

export const metadata = { title: "Analyst tools" };

export default function ToolsPage() {
  return (
    <>
      <PageHeader
        back={{ href: "/practice", label: "Practice and learn" }}
        title="Analyst tools"
        description="Practice the quick checks analysts run every day: a link, an email header, a domain's age."
      />
      <ToolsView />
    </>
  );
}
