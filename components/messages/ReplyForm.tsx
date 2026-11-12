"use client";

import { useId, useState, useTransition } from "react";
import { sendMessage } from "@/app/message-actions";
import { MESSAGE_MAX } from "@/lib/messages";

/** One box and a button, for the admin and for the tester alike. The server decides who is sending. */
export default function ReplyForm({ fid, label, button }: { fid: number; label: string; button: string }) {
  const id = useId();
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();

  return (
    <form
      className="mt-3 space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (pending || !text.trim()) return;
        start(async () => {
          const r = await sendMessage(fid, text);
          setErr(r.error ?? "");
          if (!r.error) setText(""); // keep what was typed when it failed, so nothing is lost
        });
      }}
    >
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <textarea
        id={id}
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={MESSAGE_MAX}
        rows={3}
        placeholder={label}
        className="w-full resize-none rounded-lg border border-line bg-void p-3 text-sm leading-relaxed placeholder:text-muted/70"
      />
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs tabular-nums text-muted">
          {text.length}/{MESSAGE_MAX}
        </span>
        <button type="submit" disabled={pending || !text.trim()} className="min-h-10 rounded-lg border border-accent bg-accent px-5 text-sm font-bold text-void disabled:opacity-50">
          {pending ? "Sending…" : button}
        </button>
      </div>
      {err && (
        <p role="alert" className="text-sm text-missed">
          {err}
        </p>
      )}
    </form>
  );
}
