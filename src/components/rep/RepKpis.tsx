function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border p-4 shadow-sm">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

export default function RepKpis({
  streak,
  attempts7d,
  avgScore7d,
}: {
  streak: number;
  attempts7d: number;
  avgScore7d: number;
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <Card label="Streak" value={`${streak} days`} />
      <Card label="Attempts (7d)" value={`${attempts7d}`} />
      <Card label="Avg score (7d)" value={`${avgScore7d}`} />
    </div>
  );
}
