import PageHeader from "@/components/ui/PageHeader";
import DashboardView from "@/components/dashboard/DashboardView";
import { outline } from "@/lib/roadmapRows";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Your shift at a glance: progress, accuracy and open work."
      />
      <DashboardView outline={outline()} />
    </>
  );
}
