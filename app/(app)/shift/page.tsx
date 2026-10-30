import PageHeader from "@/components/ui/PageHeader";
import ShiftView from "@/components/shift/ShiftView";

export const metadata = { title: "Shift mode" };

export default function ShiftPage() {
  return (
    <>
      <PageHeader
        back={{ href: "/practice", label: "Practice and learn" }}
        title="Shift mode"
        description="Several alerts at once. Decide what to work first and how to treat each one."
      />
      <ShiftView />
    </>
  );
}
