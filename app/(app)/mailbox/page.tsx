import PageHeader from "@/components/ui/PageHeader";
import MailboxView from "@/components/mailbox/MailboxView";

export const metadata = { title: "Phishing mailbox" };

export default function MailboxPage() {
  return (
    <>
      <PageHeader
        back={{ href: "/practice", label: "Practice and learn" }}
        title="Phishing mailbox"
        description="Staff forward emails they are unsure about. Decide if each is phishing, spam or safe, and spot the clues."
      />
      <MailboxView />
    </>
  );
}
