import { ago } from "@/lib/adminStats";
import type { Message } from "@/lib/messages";

/** The messages of one thread, oldest first. `viewer` decides the names: the admin sees "You" and "Student", the tester "ShiftLab" and "You". */
export default function MessageList({ messages, viewer, now }: { messages: Message[]; viewer: "admin" | "student"; now: number }) {
  return (
    <ul className="space-y-2">
      {messages.map((m) => {
        const mine = viewer === "admin" ? m.from_admin : !m.from_admin;
        const name = mine ? "You" : viewer === "admin" ? "Student" : "ShiftLab";
        const isNew = viewer === "student" && m.from_admin && !m.seen;
        return (
          <li key={m.id} className={`rounded-lg border p-3 text-sm ${mine ? "border-line bg-raised" : "border-accent/30 bg-accent/5"}`}>
            <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted">
              <strong className={mine ? "text-ink" : "text-accent"}>{name}</strong>
              <time dateTime={m.at}>{ago(m.at, now)}</time>
              {isNew && <span className="rounded-full bg-accent px-2 py-0.5 font-semibold text-void">New</span>}
            </p>
            <p className="mt-1 whitespace-pre-wrap leading-relaxed">{m.body}</p>
          </li>
        );
      })}
    </ul>
  );
}
