export type Finding = { level: "bad" | "warn" | "ok"; title: string; why: string };
export type UrlReport = { host: string; registrable: string; risk: "low" | "medium" | "high"; findings: Finding[] } | { error: string };

const OWN_DOMAIN = "harborpine-logistics.test";
const SHORTENERS = ["short.test", "bit.ly", "tinyurl.com", "t.co", "cutt.ly", "rb.gy"];
const BRAND_WORDS = ["harborpine", "microsoft", "office365", "paypal", "payroll", "helpdesk", "verify", "secure", "login", "account"];
const RISKY_TLDS = ["zip", "xyz", "top", "click", "country", "gq", "work"];

/** The last two labels of a host, which is where the real owner of a name sits. */
function registrable(host: string): string {
  const labels = host.split(".");
  return labels.slice(-2).join(".");
}

export function checkUrl(input: string): UrlReport {
  const raw = input.trim();
  if (!raw) return { error: "Paste a link first." };
  let url: URL;
  try {
    url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return { error: "That does not look like a valid link." };
  }
  const host = url.hostname.toLowerCase();
  const real = registrable(host);
  const findings: Finding[] = [];
  let score = 0;
  const add = (level: Finding["level"], title: string, why: string, points = 0) => {
    findings.push({ level, title, why });
    score += points;
  };

  const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
  if (isIp) add("bad", "Address is a raw IP", "Real services use names. A bare IP hides who owns the site.", 3);
  if (url.protocol === "http:") add("warn", "Not encrypted (http)", "Anything typed on this page can be read on the way. Real login pages use https.", 1);
  if (url.username || raw.includes("@")) add("bad", "Contains an @ sign", "Everything before @ is ignored by the browser, a trick to make the link look trusted.", 3);
  if (host.includes("xn--")) add("bad", "Punycode name (xn--)", "Special characters can imitate normal letters, such as a Cyrillic a instead of a Latin a.", 3);
  if (SHORTENERS.includes(host)) add("warn", "Link shortener", "The real destination is hidden. Expand it safely before trusting it.", 2);

  const ownLook = !isIp && host !== OWN_DOMAIN && !host.endsWith(`.${OWN_DOMAIN}`);
  if (ownLook && host.replace(/-/g, "").includes("harborpine")) {
    add("bad", "Imitates our company name", `The real owner is ${real}, not ${OWN_DOMAIN}. Look-alike names are the most common phishing trick.`, 3);
  } else if (ownLook) {
    const word = BRAND_WORDS.find((w) => host.includes(w));
    if (word) add("warn", `Contains the word "${word}"`, "Words like verify, secure and login are added to make a site feel official.", 1);
  }
  if (!isIp && host.split(".").length > 4) add("warn", "Many subdomains", `Only the last part counts. This site belongs to ${real}.`, 1);
  if ((host.match(/-/g) ?? []).length >= 2) add("warn", "Several hyphens in the name", "Long hyphenated names are common on throwaway domains.", 1);
  const tld = host.split(".").pop() ?? "";
  if (RISKY_TLDS.includes(tld)) add("warn", `Unusual ending .${tld}`, "Some endings are cheap and used often by attackers. Not proof by itself.", 1);
  if (/[?&](url|redirect|next|continue|dest)=https?/i.test(url.search)) add("warn", "Redirect to another site in the link", "The page can send you somewhere else after you click.", 1);
  if (url.href.length > 120) add("warn", "Very long link", "Long links can hide the real part or carry tracking data.", 1);
  if (host === OWN_DOMAIN || host.endsWith(`.${OWN_DOMAIN}`)) add("ok", "Belongs to our company domain", `${real} is ours.`, 0);
  if (findings.every((f) => f.level === "ok")) add("ok", "Nothing obviously wrong in the link itself", "Still check the page, who sent the link and why.", 0);

  const risk = score >= 3 ? "high" : score >= 1 ? "medium" : "low";
  return { host, registrable: real, risk, findings };
}
