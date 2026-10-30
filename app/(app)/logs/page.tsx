import PageHeader from "@/components/ui/PageHeader";
import LogsView from "@/components/logs/LogsView";

export const metadata = { title: "Log search" };

export default function LogsPage() {
  return (
    <>
      <PageHeader
        back={{ href: "/practice", label: "Practice and learn" }}
        title="Log search"
        description="Logs record what computers did. Searching them is how analysts find out what really happened."
      />
      <LogsView />
    </>
  );
}
