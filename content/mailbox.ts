export type AuthResult = "pass" | "fail" | "none";

export type Mail = {
  id: string;
  receivedAt: string;
  reportedBy: string;
  subject: string;
  fromName: string;
  fromAddress: string;
  replyTo?: string;
  returnPath: string;
  auth: { spf: AuthResult; dkim: AuthResult; dmarc: AuthResult };
  /** Mail servers the message passed through, newest first */
  received: string[];
  body: string[];
  /** What the reader sees vs where the link really goes */
  links: { shows: string; goes: string }[];
  attachment?: string;
};

/** Checklist shown for every email. Which ones apply is decided on the server. */
export const FLAGS: { id: string; label: string }[] = [
  { id: "lookalike", label: "Sender domain imitates ours" },
  { id: "display-name", label: "Display name imitates a colleague but the address does not match" },
  { id: "auth-fail", label: "Email authentication failed or is missing" },
  { id: "reply-mismatch", label: "Reply-To goes somewhere different from the sender" },
  { id: "link-mismatch", label: "Link text and real destination do not match" },
  { id: "shortener", label: "Shortened link hides the destination" },
  { id: "urgency", label: "Pressure to act quickly" },
  { id: "money", label: "Asks for money, gift cards, payment or bank details" },
  { id: "macro", label: "Asks you to open a file and enable macros or content" },
  { id: "unexpected", label: "Unexpected and out of the blue" },
];

export const MAILS: Mail[] = [
  {
    id: "M-01",
    receivedAt: "Oct 24, 08:12",
    reportedBy: "s.nair (Warehouse)",
    subject: "Action required: your mailbox is almost full",
    fromName: "IT Helpdesk",
    fromAddress: "support@harborpine-helpdesk.test",
    returnPath: "bounce@mailer-77.harborpine-helpdesk.test",
    auth: { spf: "fail", dkim: "none", dmarc: "fail" },
    received: [
      "by mx.harborpine-logistics.test, 08:12:05",
      "from mailer-77.harborpine-helpdesk.test (203.0.113.201), 08:12:03",
    ],
    body: [
      "Hello,",
      "Your mailbox has used 98% of its storage. Mailboxes that stay full stop receiving mail within 24 hours.",
      "Verify your account now to get 20 GB of extra space.",
    ],
    links: [
      {
        shows: "https://mail.harborpine-logistics.test/storage",
        goes: "https://harborpine-helpdesk.test/storage/login?u=s.nair",
      },
    ],
  },
  {
    id: "M-02",
    receivedAt: "Oct 24, 08:40",
    reportedBy: "m.dsouza (Finance)",
    subject: "Payroll details form is now open in the HR portal",
    fromName: "Harbor & Pine HR",
    fromAddress: "hr@harborpine-logistics.test",
    returnPath: "hr@harborpine-logistics.test",
    auth: { spf: "pass", dkim: "pass", dmarc: "pass" },
    received: ["by mx.harborpine-logistics.test, 08:40:12", "from hr-mail-01.harborpine-logistics.test (10.20.3.8), 08:40:10"],
    body: [
      "Hi all,",
      "As we discussed at Thursday's staff meeting, the annual payroll details form is now open in the HR portal. Please review your details before the end of the month.",
      "You do not need to reply to this email. If something looks wrong in the portal, contact HR on the usual extension.",
    ],
    links: [
      {
        shows: "https://portal.harborpine-logistics.test/hr/forms",
        goes: "https://portal.harborpine-logistics.test/hr/forms",
      },
    ],
  },
  {
    id: "M-03",
    receivedAt: "Oct 24, 09:05",
    reportedBy: "r.thomas (Reception)",
    subject: "Weekend flash sale: 60% off office chairs",
    fromName: "ShopDeals Weekly",
    fromAddress: "hello@shopdeals-weekly.test",
    returnPath: "bounce@shopdeals-weekly.test",
    auth: { spf: "pass", dkim: "pass", dmarc: "pass" },
    received: ["by mx.harborpine-logistics.test, 09:05:44", "from mail.shopdeals-weekly.test (198.51.100.61), 09:05:42"],
    body: [
      "Our biggest sale of the year ends Sunday.",
      "Chairs, desks and lamps up to 60% off. Free delivery on orders over 50.",
      "You are receiving this because you subscribed to ShopDeals Weekly. Unsubscribe any time.",
    ],
    links: [
      { shows: "Shop the sale", goes: "https://shopdeals-weekly.test/sale" },
      { shows: "Unsubscribe", goes: "https://shopdeals-weekly.test/unsubscribe" },
    ],
  },
  {
    id: "M-04",
    receivedAt: "Oct 24, 09:31",
    reportedBy: "p.verma (Procurement)",
    subject: "Quick favour",
    fromName: "Meera Joshi (CEO)",
    fromAddress: "meera.joshi.ceo@freemail-box.test",
    replyTo: "m.joshi.urgent@mail-proton.test",
    returnPath: "meera.joshi.ceo@freemail-box.test",
    auth: { spf: "none", dkim: "none", dmarc: "none" },
    received: ["by mx.harborpine-logistics.test, 09:31:20", "from smtp.freemail-box.test (198.51.100.9), 09:31:18"],
    body: [
      "Are you at your desk? I am in a meeting and cannot take calls.",
      "I need you to buy 5 gift cards worth 100 each for a client today. It is urgent. Reply with the card codes and I will reimburse you this afternoon.",
      "Please keep this between us for now.",
    ],
    links: [],
  },
  {
    id: "M-05",
    receivedAt: "Oct 24, 10:02",
    reportedBy: "d.okafor (Accounts)",
    subject: "Invoice 4471 - overdue",
    fromName: "Accounts, BlueCrate Supplies",
    fromAddress: "accounts@bluecrate-supplies.test",
    returnPath: "accounts@bluecrate-supplies.test",
    auth: { spf: "pass", dkim: "pass", dmarc: "pass" },
    received: ["by mx.harborpine-logistics.test, 10:02:31", "from mail.bluecrate-supplies.test (198.51.100.88), 10:02:29"],
    body: [
      "Hello,",
      "Please find the overdue invoice attached. Open the file and click Enable Content to see the full details.",
      "Payment is due today to avoid late fees.",
    ],
    links: [],
    attachment: "Invoice_4471.xlsm (macro-enabled workbook, 212 KB)",
  },
  {
    id: "M-06",
    receivedAt: "Oct 24, 10:20",
    reportedBy: "a.kapoor (Operations)",
    subject: "Planned VPN maintenance, Saturday 22:00 to 23:00",
    fromName: "IT Notices",
    fromAddress: "it-notices@harborpine-logistics.test",
    returnPath: "it-notices@harborpine-logistics.test",
    auth: { spf: "pass", dkim: "pass", dmarc: "pass" },
    received: ["by mx.harborpine-logistics.test, 10:20:09", "from it-mail-01.harborpine-logistics.test (10.20.3.9), 10:20:07"],
    body: [
      "The VPN will be unavailable on Saturday between 22:00 and 23:00 while we upgrade the gateway.",
      "Nothing is needed from you. Status updates will be on the intranet page.",
    ],
    links: [
      {
        shows: "https://intranet.harborpine-logistics.test/status",
        goes: "https://intranet.harborpine-logistics.test/status",
      },
    ],
  },
  {
    id: "M-07",
    receivedAt: "Oct 24, 10:48",
    reportedBy: "j.mehta (Dispatch)",
    subject: "Your parcel could not be delivered",
    fromName: "ParcelTrack",
    fromAddress: "delivery@parcel-track-now.test",
    returnPath: "bounce@parcel-track-now.test",
    auth: { spf: "none", dkim: "none", dmarc: "none" },
    received: ["by mx.harborpine-logistics.test, 10:48:50", "from vps-4410.parcel-track-now.test (203.0.113.77), 10:48:47"],
    body: [
      "We tried to deliver your parcel but nobody was home.",
      "Pay a small redelivery fee of 1.99 within 48 hours or the parcel will be returned to the sender.",
    ],
    links: [{ shows: "https://parcel-track-now.test/track/88213", goes: "https://short.test/aB3xQ9" }],
  },
];
