import { notFound } from "next/navigation";
import PlaybookDetail from "@/components/playbooks/PlaybookDetail";
import { PLAYBOOKS } from "@/content/playbooks";

// Every slug is known at build time, so the page is fully static.
export function generateStaticParams() {
  return PLAYBOOKS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: PLAYBOOKS.find((p) => p.slug === slug)?.title ?? "Playbook" };
}

export default async function PlaybookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const playbook = PLAYBOOKS.find((p) => p.slug === slug);
  if (!playbook) notFound();
  return <PlaybookDetail playbook={playbook} />;
}
