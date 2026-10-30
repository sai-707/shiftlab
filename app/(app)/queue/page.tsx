import PageHeader from "@/components/ui/PageHeader";
import QueueView from "@/components/queue/QueueView";

export const metadata = { title: "Alert queue" };

export default function QueuePage() {
  return (
    <>
      <PageHeader
        title="Alert queue"
        description="Incoming alerts, sorted by severity. Assign one to yourself to start investigating."
      />
      <QueueView />
    </>
  );
}
