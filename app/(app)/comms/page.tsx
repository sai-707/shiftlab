import PageHeader from "@/components/ui/PageHeader";
import CommsView from "@/components/comms/CommsView";

export const metadata = { title: "Communication practice" };

export default function CommsPage() {
  return (
    <>
      <PageHeader
        back={{ href: "/practice", label: "Practice and learn" }}
        title="Communication practice"
        description="Half of an analyst's job is writing. Reply to users, managers and Level 2, then compare with a model answer."
      />
      <CommsView />
    </>
  );
}
