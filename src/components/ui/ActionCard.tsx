import Link from "next/link";

export default function ActionCard({
  title,
  description,
  href,
  cta,
}: {
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <Link href={href} className="block rounded-2xl border bg-white p-5 shadow-sm hover:bg-muted/30">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-2 text-sm text-muted-foreground">{description}</div>
      <div className="mt-4 inline-flex rounded-xl border bg-white px-3 py-2 text-sm font-medium">
        {cta} →
      </div>
    </Link>
  );
}
