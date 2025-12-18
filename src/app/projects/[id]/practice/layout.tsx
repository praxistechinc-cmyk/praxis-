export default function PracticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Focus mode: no AppShell header/nav
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-6xl px-6 py-6">
        {children}
      </div>
    </main>
  );
}
