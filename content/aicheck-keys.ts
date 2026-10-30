// SERVER ONLY. For each drill: which draft sentences are wrong (0-based) and why.
export type AiKey = { wrong: Record<number, string>; habit: string };

export const AI_KEYS: Record<string, AiKey> = {
  log4shell: {
    wrong: {
      1: "The asset list says Log4j 2.17.1, a patched version. The draft invented an old version number.",
      4: "The servers are patched, every request was blocked and nothing called back. The conclusion does not follow from the evidence.",
    },
    habit: "Check every number and version against the source. A wrong fact early in a draft often leads to a wrong conclusion at the end.",
  },
  "gateway-travel": {
    wrong: {
      1: "The device record says both sign-ins came from the same managed laptop, LT-4471.",
      3: "The sign-in log says MFA was requested and passed both times.",
    },
    habit: "An AI will often write a detail that sounds plausible. Find the line in the evidence that proves it, and if you cannot, flag it.",
  },
  "voicemail-phish": {
    wrong: {
      1: "The proxy blocked both pages before they loaded and recorded no POST requests, so nobody entered a password.",
      4: "No credentials were submitted. A stolen password is a claim the evidence does not support.",
    },
    habit: "Watch for certainty that the evidence does not give you. 'Clicked' is not the same as 'entered a password'.",
  },
  "phone-lockout": {
    wrong: {},
    habit: "A draft can be fully correct. Do not invent problems to look careful. Check each sentence, and when all of them hold up, trust it and move on.",
  },
  "ransomware-backup": {
    wrong: {
      3: "The process was still running at 02:36 and the share is still connected, so more files are being lost. Good backups do not make this low risk or let it wait.",
    },
    habit: "Be most suspicious of sentences that tell you to relax. Reassurance that delays action needs the strongest proof.",
  },
  "deploy-key": {
    wrong: {
      2: "The CI server is in eu-west and the new servers were started in ap-south. They are in a different region.",
      3: "The access log says the key has not read any storage bucket or database so far. The draft made up a data theft.",
    },
    habit: "A draft can overstate the damage as easily as understate it. Both mistakes send Level 2 in the wrong direction.",
  },
};
