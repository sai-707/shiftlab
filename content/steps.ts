// Bonus investigation steps 5 (timeline) and 6 (scope). Client-safe: nothing here says which events matter or what the right marks are.
// The answers live in content/steps-keys.ts (server only). Add an alert here and there, nowhere else.
export type TimelineEvent = { id: string; time: string; text: string };
export type ScopeRow = { id: string; name: string; log: string };
export type StepChallenge = {
  timeline?: { events: TimelineEvent[] };
  scope?: { question: string; options: string[]; rows: ScopeRow[] };
};

// Events are listed out of order on purpose.
export const STEP_CHALLENGES: Record<string, StepChallenge> = {
  "SL-1033": {
    timeline: {
      events: [
        { id: "t5", time: "11:31", text: "A mailbox rule is created to hide messages about invoices and payments" },
        { id: "t2", time: "11:08", text: "d.kamath signs in from the Pune office on a managed laptop, MFA passed" },
        { id: "t7", time: "11:42", text: "A staff report raises this alert" },
        { id: "t1", time: "11:02", text: "The 40 emails are delivered" },
        { id: "t8", time: "10:30", text: "The weekly vulnerability scan finishes" },
        { id: "t4", time: "11:24", text: "A sign-in as d.kamath from a hosting provider in Amsterdam" },
        { id: "t3", time: "11:09", text: "d.kamath opens the link and submits the form" },
        { id: "t6", time: "11:33", text: "Six emails go from d.kamath's mailbox to vendors asking them to confirm new bank details" },
      ],
    },
    scope: {
      question: "Use the recipient table and the proxy log. How far did this reach?",
      options: ["Compromised", "Clicked only", "Opened only", "Not opened"],
      rows: [
        { id: "s1", name: "d.kamath", log: "opened, clicked, typed a password" },
        { id: "s2", name: "n.dsouza", log: "opened, clicked, no form submitted" },
        { id: "s3", name: "t.pillai", log: "opened, clicked, no form submitted" },
        { id: "s4", name: "29 other recipients", log: "opened, no click" },
        { id: "s5", name: "8 other recipients", log: "not opened" },
      ],
    },
  },
  "SL-1027": {
    timeline: {
      events: [
        { id: "t6", time: "03:31", text: "lk.exe starts and files begin to be renamed" },
        { id: "t1", time: "01:00", text: "The nightly backup to BK-01 completes" },
        { id: "t4", time: "03:29", text: "Remote commands start running on FS-02 from HR-WS-088" },
        { id: "t3", time: "02:55", text: "adm.rkulkarni connects by RDP to HR-WS-088" },
        { id: "t8", time: "02:30", text: "A scheduled signature update runs on FS-02" },
        { id: "t5", time: "03:30", text: "Shadow copies and recovery options are deleted on FS-02" },
        { id: "t2", time: "02:48", text: "adm.rkulkarni logs in over the VPN from an unknown address, no MFA" },
        { id: "t7", time: "03:32", text: "EDR blocks a shadow copy deletion on FS-03" },
      ],
    },
    scope: {
      question: "Use the spread check and the authentication log. What state is each machine in?",
      options: ["Encrypted", "Attacked, blocked", "Used by the attacker", "Untouched"],
      rows: [
        { id: "s1", name: "FS-02 (finance file server)", log: "shadow copies deleted, files being renamed" },
        { id: "s2", name: "FS-03", log: "shadow copy deletion attempted at 03:32" },
        { id: "s3", name: "HR-WS-088 (workstation)", log: "remote commands came from here" },
        { id: "s4", name: "FS-01", log: "no shadow copy deletion, no renames" },
        { id: "s5", name: "BK-01 (backup server)", log: "last nightly backup completed OK" },
      ],
    },
  },
};
