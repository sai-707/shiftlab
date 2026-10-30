import PageHeader from "@/components/ui/PageHeader";
import LookupBox from "@/components/lookup/LookupBox";

export const metadata = { title: "Intel check" };

export default function LookupPage() {
  return (
    <>
      <PageHeader
        title="Intel check"
        description="Paste an IP address, domain, link or file hash. We check it against 24 security vendors and tell you in plain words what it means."
      />
      <div className="max-w-3xl rounded-xl border border-line bg-panel p-5">
        <LookupBox />
      </div>
    </>
  );
}
