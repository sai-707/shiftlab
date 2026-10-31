// When the feedback window may open by itself, right after a case is closed. Plain data and no imports, so a test can load it.
// The rule: ask after a closed case until the person has sent feedback once, or has skipped MAX_SKIPS times. Then stop for good.
// shortcut: the memory is one value in this browser's storage; a browser that blocks storage is asked after every case. Move it to the account if that matters.

export const MAX_SKIPS = 2;
export const ASK_KEY = "shiftlab.fbask.v1";

export type AskState = { sent: boolean; skips: number };

export const shouldAsk = (s: AskState): boolean => !s.sent && s.skips < MAX_SKIPS;

/** Reads whatever is stored and returns a safe value, even for junk. */
export function parseAsk(raw: string | null): AskState {
  try {
    const v = JSON.parse(raw ?? "");
    const skips = Number.isInteger(v?.skips) && v.skips > 0 ? Math.min(v.skips, 99) : 0;
    return { sent: v?.sent === true, skips };
  } catch {
    return { sent: false, skips: 0 };
  }
}

export function readAsk(): AskState {
  try {
    return parseAsk(localStorage.getItem(ASK_KEY));
  } catch {
    return { sent: false, skips: 0 };
  }
}

function write(s: AskState) {
  try {
    localStorage.setItem(ASK_KEY, JSON.stringify(s));
  } catch {
    /* storage blocked: nothing to remember with */
  }
}

export const noteSent = () => write({ ...readAsk(), sent: true });
export const noteSkipped = () => {
  const s = readAsk();
  write({ ...s, skips: s.skips + 1 });
};
