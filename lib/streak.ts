// Pure helpers for the dashboard streak: turn the saved cases into one count per day, and count the streaks.
// A "report" is one submitted try, so a retry on another day counts as practice on that day.
import { attemptsOf } from "./attempts";
import type { CaseRecord } from "./types";

export type StreakDay = { date: string; count: number };

const DAY = 86_400_000;

/** The calendar day of a moment in the visitor's own time zone, as YYYY-MM-DD. */
export function localIso(time: number): string {
  const d = new Date(time);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

/** Reports submitted per local day, from every try in every closed case. */
export function reportsPerDay(cases: Record<string, CaseRecord>): Map<string, number> {
  const perDay = new Map<string, number>();
  for (const record of Object.values(cases)) {
    for (const attempt of attemptsOf(record)) {
      if (!Number.isFinite(attempt.at)) continue;
      const key = localIso(attempt.at);
      perDay.set(key, (perDay.get(key) ?? 0) + 1);
    }
  }
  return perDay;
}

/** The last `span` days ending on `today` (YYYY-MM-DD), oldest first, with zeros where nothing happened. */
export function lastDays(perDay: Map<string, number>, today: string, span: number): StreakDay[] {
  // Walk in UTC from the date's own digits, so a daylight-saving jump can never skip or repeat a day.
  const end = Date.parse(`${today}T00:00:00Z`);
  const days: StreakDay[] = [];
  for (let i = span - 1; i >= 0; i--) {
    const date = new Date(end - i * DAY).toISOString().slice(0, 10);
    days.push({ date, count: perDay.get(date) ?? 0 });
  }
  return days;
}

/**
 * Current streak: consecutive days with a report, counting back from today. If today is still empty the streak is not broken
 * yet: it counts back from yesterday, so a student who solved yesterday still sees their streak until the day ends.
 * Longest streak: the best run anywhere in the history.
 */
export function streaks(perDay: Map<string, number>, today: string): { current: number; longest: number } {
  const end = Date.parse(`${today}T00:00:00Z`);
  const iso = (t: number) => new Date(t).toISOString().slice(0, 10);

  let current = 0;
  let t = perDay.get(iso(end)) ? end : end - DAY;
  while (perDay.get(iso(t))) {
    current++;
    t -= DAY;
  }

  const dates = [...perDay.keys()].filter((k) => (perDay.get(k) ?? 0) > 0).sort();
  let longest = 0;
  let run = 0;
  let prev = NaN;
  for (const date of dates) {
    const time = Date.parse(`${date}T00:00:00Z`);
    run = time - prev === DAY ? run + 1 : 1;
    prev = time;
    if (run > longest) longest = run;
  }
  return { current, longest };
}
