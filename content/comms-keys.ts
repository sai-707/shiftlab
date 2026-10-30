// Server only. Checklists are matched against the student's message by simple word fragments.
export type CommsKey = {
  checks: { label: string; any: string[] }[];
  sample: string;
  tip: string;
};

export const COMMS_KEYS: Record<string, CommsKey> = {
  c1: {
    checks: [
      { label: "Reassures the user and does not blame them", any: ["not in trouble", "no worries", "don't worry", "do not worry", "thank you for", "thanks for", "right thing", "happens to", "not your fault", "glad you"] },
      { label: "Tells them to change their password now", any: ["change your password", "reset your password", "change the password", "reset the password", "new password", "change it"] },
      { label: "Asks for useful details (time, device, what they typed)", any: ["what time", "when did", "which device", "what you typed", "did you enter", "anything else", "other details", "what did you"] },
      { label: "Says what you will do next", any: ["i will", "i'll", "we will", "we'll", "i am checking", "i'm checking", "we are checking", "check your account", "review your account", "look into"] },
      { label: "Tells them not to click or forward the email again", any: ["do not click", "don't click", "do not forward", "don't forward", "do not reply", "don't reply", "leave the email", "do not open", "don't open"] },
    ],
    sample:
      "Hi Sunita, thank you for telling us so quickly. You are not in trouble, this email fools many people. Please change your password now from a different device if you can. I will check your account for any unusual sign-ins and block the fake site for everyone. Could you tell me roughly what time you clicked and whether you typed anything besides your password? Please do not click the link again or forward the email.",
    tip: "Users who fear blame stop reporting. Be kind first, then give one clear action.",
  },
  c2: {
    checks: [
      { label: "Names the host", any: ["web-bastion-02", "10.20.1.12"] },
      { label: "Gives the attacker address", any: ["203.0.113.58"] },
      { label: "Gives times", any: ["02:41", "02:43", "02:43:58"] },
      { label: "Says what happened: many failures then a success", any: ["failed", "failures", "brute"] },
      { label: "Names the account that got in", any: ["admin"] },
      { label: "Mentions the follow-up action (curl with sudo)", any: ["curl", "sudo"] },
      { label: "Says what you did or did not do", any: ["not touched", "have not", "haven't", "did not", "didn't", "no changes", "left it", "not isolated"] },
      { label: "Asks for a clear next action", any: ["isolate", "contain", "disable", "reset", "block", "please investigate", "please review", "rotate", "revoke"] },
    ],
    sample:
      "Escalating SL-1003 as a confirmed compromise. Host web-bastion-02 (10.20.1.12) received 25 failed SSH logins from 203.0.113.58 between 02:41 and 02:43, then the admin account logged in successfully at 02:43:58 and ran curl with sudo. Intel lists 203.0.113.58 as a known attacker. I have not touched the server. Please isolate the host, disable and reset the admin credentials, and check what curl downloaded.",
    tip: "Good notes answer: what, where, when, how you know, what you did, and what you need.",
  },
  c3: {
    checks: [
      { label: "Answers the question directly (not an attack)", any: ["not an attack", "no attack", "harmless", "false alarm", "false positive", "expected", "safe", "was our own", "approved"] },
      { label: "Explains why the alert fired in plain words", any: ["scanner", "scan", "looks like", "looked like", "vulnerability"] },
      { label: "Says whether action is needed", any: ["no action", "nothing needed", "nothing to do", "nothing is needed", "no need", "you do not need", "you don't need", "no further"] },
      { label: "Mentions the follow-up (tune the rule or exception)", any: ["tune", "tuning", "exception", "allow-list", "allowlist", "whitelist", "exclude", "suppress", "next week"] },
      { label: "Keeps it short (under 70 words)", any: ["__short__"] },
    ],
    sample:
      "No, that was not an attack. It was our approved vulnerability scanner (change ticket CHG-2231) which runs every Wednesday night and looks like a port scan to the rule. No action is needed from you. I will ask for the scanner to be excluded so the alert does not fire again next week.",
    tip: "Managers want the answer first, then one line of reason, then what happens next.",
  },
  c4: {
    checks: [
      { label: "Acknowledges the urgency kindly", any: ["understand", "i know", "sorry", "i can see", "let's get", "let us get", "quickly", "right away", "as fast"] },
      { label: "Asks to confirm identity before unlocking", any: ["verify", "confirm your identity", "confirm it's you", "confirm it is you", "prove", "employee id", "your manager", "call you back", "security question"] },
      { label: "Explains briefly why it locked (failed attempts)", any: ["failed", "attempts", "sign-in attempts", "several", "unusual", "unfamiliar"] },
      { label: "Gives a clear next step", any: ["please reply", "please call", "please send", "please confirm", "next step", "can you", "could you", "call me", "ring"] },
      { label: "Does not promise to unlock before checking", any: ["__no_unlock_promise__"] },
    ],
    sample:
      "Hi Daniel, I understand the timing and I will get you back in as fast as I can. Your account locked after 8 failed sign-ins from an address we do not recognise, so I need to confirm it is really you before I unlock it. Please call me on the helpdesk line or send your employee ID and your manager's name, and I will unlock it straight away once that is done.",
    tip: "Policy is not rudeness. Say why, say how long, and make the next step easy.",
  },
};
