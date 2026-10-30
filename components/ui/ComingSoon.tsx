export default function ComingSoon({ note }: { note: string }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-panel p-8 text-sm text-muted">
      {note}
    </div>
  );
}
