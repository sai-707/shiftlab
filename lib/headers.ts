export type HeaderReport =
  | { error: string }
  | {
      fields: { label: string; value: string }[];
      auth: { name: string; result: string }[];
      hops: string[];
      flags: { level: "bad" | "warn"; text: string }[];
    };

export const SAMPLE_HEADERS = `Received: from mailer-77.harborpine-helpdesk.test (mailer-77.harborpine-helpdesk.test [203.0.113.201])
 by mx.harborpine-logistics.test with ESMTP; Sat, 24 Oct 2026 08:12:05 +0530
Received: from localhost (127.0.0.1) by mailer-77.harborpine-helpdesk.test; Sat, 24 Oct 2026 08:12:03 +0530
Authentication-Results: mx.harborpine-logistics.test; spf=fail smtp.mailfrom=harborpine-helpdesk.test; dkim=none; dmarc=fail header.from=harborpine-helpdesk.test
From: "IT Helpdesk" <support@harborpine-helpdesk.test>
Reply-To: <helpdesk.reply@mail-proton.test>
Return-Path: <bounce@mailer-77.harborpine-helpdesk.test>
To: s.nair@harborpine-logistics.test
Subject: Action required: your mailbox is almost full
Message-ID: <8841.7731@mailer-77.harborpine-helpdesk.test>`;

const domainOf = (addr: string) => (addr.match(/@([a-z0-9.-]+)/i)?.[1] ?? "").toLowerCase();

export function readHeaders(text: string): HeaderReport {
  const raw = text.trim();
  if (!raw) return { error: "Paste the raw email headers first." };
  if (raw.length > 20000) return { error: "That is too long. Paste only the header block." };

  // lines starting with space or tab continue the previous header
  const unfolded = raw.replace(/\r?\n[ \t]+/g, " ").split(/\r?\n/);
  const map = new Map<string, string[]>();
  for (const line of unfolded) {
    const m = line.match(/^([A-Za-z-]+):\s*(.*)$/);
    if (!m) continue;
    const k = m[1].toLowerCase();
    map.set(k, [...(map.get(k) ?? []), m[2]]);
  }
  if (map.size === 0) return { error: "No headers found. Each line should look like Name: value." };

  const first = (k: string) => map.get(k)?.[0] ?? "";
  const from = first("from");
  const replyTo = first("reply-to");
  const returnPath = first("return-path");
  const authLine = (map.get("authentication-results") ?? []).join(" ");

  const auth = ["spf", "dkim", "dmarc"].map((name) => ({
    name: name.toUpperCase(),
    result: authLine.match(new RegExp(`${name}=([a-z]+)`, "i"))?.[1].toLowerCase() ?? "not found",
  }));

  const flags: { level: "bad" | "warn"; text: string }[] = [];
  for (const a of auth) {
    if (a.result === "fail" || a.result === "softfail") flags.push({ level: "bad", text: `${a.name} ${a.result}: the sender could not be verified.` });
    else if (a.result === "not found" || a.result === "none") flags.push({ level: "warn", text: `${a.name} is missing, so there is no proof of who sent this.` });
  }
  const fromDomain = domainOf(from);
  if (replyTo && domainOf(replyTo) !== fromDomain) flags.push({ level: "bad", text: `Reply-To (${domainOf(replyTo)}) is a different domain from From (${fromDomain}). Replies would go elsewhere.` });
  if (returnPath && fromDomain && !domainOf(returnPath).endsWith(fromDomain)) flags.push({ level: "warn", text: `Return-Path domain (${domainOf(returnPath)}) does not match From (${fromDomain}).` });
  if (/harborpine/.test(fromDomain) && fromDomain !== "harborpine-logistics.test") flags.push({ level: "bad", text: `${fromDomain} imitates our company domain.` });
  if (!from) flags.push({ level: "warn", text: "No From header found." });

  const hops = (map.get("received") ?? []).slice().reverse();
  return {
    fields: [
      { label: "From", value: from || "-" },
      { label: "Reply-To", value: replyTo || "-" },
      { label: "Return-Path", value: returnPath || "-" },
      { label: "To", value: first("to") || "-" },
      { label: "Subject", value: first("subject") || "-" },
      { label: "Message-ID", value: first("message-id") || "-" },
    ],
    auth,
    hops,
    flags,
  };
}
