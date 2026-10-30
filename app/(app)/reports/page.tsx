import PageHeader from "@/components/ui/PageHeader";
import ReportsView from "@/components/reports/ReportsView";

export const metadata = { title: "Case reports" };

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Case reports"
        description="Every report you have written, with your score and coaching."
      />
      <ReportsView />
    </>
  );
}
