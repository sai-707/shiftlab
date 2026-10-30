import type { IntelResult } from "@/lib/types";

type Described = Omit<IntelResult, "query">;

const IPV4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
const HASH_LENGTH: Record<number, string> = { 32: "MD5", 40: "SHA-1", 64: "SHA-256" };
const DOMAIN = /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;

/**
 * Explains an indicator that is not in the fictional feed: what it is and how to check it
 * yourself. No record is never a verdict of "safe".
 */
export function describeUnknown(value: string): Described {
  const v = value.trim().toLowerCase();

  if (/^[\d.]+$/.test(v) && v.includes(".")) {
    const m = IPV4.exec(v);
    const octets = m ? m.slice(1).map(Number) : [];
    if (!m || octets.some((o) => o > 255)) {
      return { verdict: "unknown", kind: "Not an IP address", note: "An IPv4 address has four numbers from 0 to 255, like 203.0.113.58. Check for a typo." };
    }
    const [a, b] = octets;
    const priv =
      a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a === 127 || (a === 169 && b === 254);
    if (priv) {
      return {
        verdict: "internal",
        kind: "Private IP address",
        note: "This address sits inside a private range, so it belongs to a machine on our own network, not the internet. Look it up in the asset inventory: who owns it, what is it for, and is it normal for it to do this?",
      };
    }
    return {
      verdict: "unknown",
      kind: "Public IP address",
      note: "Not in ShiftLab's feed. In a real SOC you would check: who owns the address (WHOIS), its reputation on sites like AbuseIPDB or VirusTotal, whether it has touched other hosts of ours, and whether we have any business reason to talk to it.",
    };
  }

  if (/^[0-9a-f]+$/.test(v) && HASH_LENGTH[v.length]) {
    return {
      verdict: "unknown",
      kind: `File hash (${HASH_LENGTH[v.length]})`,
      note: "Not in ShiftLab's feed. In a real SOC you would search the hash on VirusTotal, check the file's name, path and signer on the endpoint, and see which other machines have the same file.",
    };
  }

  if (DOMAIN.test(v)) {
    return {
      verdict: "unknown",
      kind: "Domain",
      note: "Not in ShiftLab's feed. In a real SOC you would check how old the domain is, who registered it, whether it imitates one of ours, and what a safe URL scanner shows on its page.",
    };
  }

  return {
    verdict: "unknown",
    kind: "Not recognised",
    note: "Enter an IPv4 address, a domain, a URL or a file hash (MD5, SHA-1 or SHA-256).",
  };
}
