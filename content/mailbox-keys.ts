// Server only. Never import this from a client component.
export type MailVerdict = "phishing" | "spam" | "legit";

export type MailKey = { verdict: MailVerdict; flags: string[]; explain: string; action: string };

export const MAIL_KEYS: Record<string, MailKey> = {
  "M-01": {
    verdict: "phishing",
    flags: ["lookalike", "auth-fail", "link-mismatch", "urgency"],
    explain:
      "harborpine-helpdesk.test is not our domain, SPF and DMARC failed, and the button says one address but goes to another that asks for a login. A full mailbox with a 24 hour deadline is a classic pressure line.",
    action:
      "Block the sender domain, search for the same email in other mailboxes and delete it, and check the proxy logs for anyone who opened the link. If s.nair clicked, treat it as a possible stolen password.",
  },
  "M-02": {
    verdict: "legit",
    flags: [],
    explain:
      "It comes from our own domain, passes all three checks, the link goes where it says, nothing is urgent, and it matches an announcement people already know about. A sensitive topic alone does not make an email phishing.",
    action: "Tell the user it is safe, close the report and, if you like, mention that they did the right thing by asking.",
  },
  "M-03": {
    verdict: "spam",
    flags: ["unexpected"],
    explain:
      "It is authenticated bulk marketing from a company the user once subscribed to. It is annoying but not trying to trick anyone. Spam is not worth an investigation.",
    action: "Mark as spam or add a filter, thank the user and close. No escalation.",
  },
  "M-04": {
    verdict: "phishing",
    flags: ["display-name", "reply-mismatch", "auth-fail", "urgency", "money", "unexpected"],
    explain:
      "The display name says CEO but the address is a free mail service, replies go to a third address, nothing authenticates, and it asks for gift cards with secrecy and urgency. This is a business email compromise attempt.",
    action:
      "Delete it everywhere, block both addresses, warn the finance and executive assistant teams, and confirm p.verma did not reply or buy cards.",
  },
  "M-05": {
    verdict: "phishing",
    flags: ["macro", "urgency", "unexpected"],
    explain:
      "All three checks pass, which only proves the mail really came from that domain. The vendor's mailbox may be compromised. A macro-enabled file that tells you to click Enable Content is a common way to run malware.",
    action:
      "Do not open the file. Quarantine the email, check whether d.okafor opened it (look for Office spawning scripts), and warn BlueCrate through a phone number you already have, not one from the email.",
  },
  "M-06": {
    verdict: "legit",
    flags: [],
    explain:
      "Internal sender, all checks pass, the link goes to our intranet, and the email asks for nothing. It is a normal notice.",
    action: "Reassure the user and close the report.",
  },
  "M-07": {
    verdict: "phishing",
    flags: ["auth-fail", "link-mismatch", "shortener", "urgency", "money", "unexpected"],
    explain:
      "Nothing authenticates, the link shows one site but goes to a shortener, and it threatens a deadline to collect a small payment. Small fees are used to steal card details.",
    action: "Block parcel-track-now.test and the short link, delete the email from other mailboxes, and ask j.mehta whether any card details were entered.",
  },
};
