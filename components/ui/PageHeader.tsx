import Link from "next/link";

export default function PageHeader({
  title,
  description,
  back,
}: {
  title: string;
  description: string;
  /** Shows a small link above the title, for pages that sit inside a section */
  back?: { href: string; label: string };
}) {
  return (
    <header className="mb-8">
      {back && (
        <Link href={back.href} className="mb-2 inline-block text-sm text-muted hover:text-accent">
          ← {back.label}
        </Link>
      )}
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-1 text-sm text-muted">{description}</p>
    </header>
  );
}
