import Link from "next/link";
import ProjectNav from "@/components/shell/ProjectNav";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {/* AppShell Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-sm font-semibold tracking-tight">
                Praxis
              </Link>
              <span className="text-xs text-muted-foreground">/</span>
              <Link
                href={`/projects/${id}/overview`}
                className="text-sm text-muted-foreground hover:text-gray-900"
              >
                Project {id}
              </Link>
            </div>

            <ProjectNav projectId={id} />
          </div>
        </div>
      </header>

      {/* Page content */}
      <div className="mx-auto max-w-6xl px-6 py-6">{children}</div>
    </main>
  );
}
