import PageHeader from "@/components/ui/PageHeader";
import HandoverView from "@/components/handover/HandoverView";

export const metadata = { title: "Shift handover" };

export default function HandoverPage() {
  return (
    <>
      <PageHeader
        title="Shift handover"
        description="Write the notes the next shift needs. It fills in from your cases, and you add the rest."
      />
      <HandoverView />
    </>
  );
}
