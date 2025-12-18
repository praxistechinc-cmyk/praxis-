type Props = {
  totalAttempts: number;
  activeReps: number;
  avgScore: number;
  readiness: number;
  sessionsCount: number;
  avgSessionScore: number;
};

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border p-4 shadow-sm">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

export default function KpiCards({
  totalAttempts,
  activeReps,
  avgScore,
  readiness,
  sessionsCount,
  avgSessionScore,
}: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
      <Card label="Attempts" value={String(totalAttempts)} />
      <Card label="Active reps" value={String(activeReps)} />
      <Card label="Avg score" value={`${avgScore}`} />
      <Card label="Team readiness" value={`${readiness}%`} />
      <Card label="Sessions" value={String(sessionsCount)} />
      <Card label="Avg session" value={`${avgSessionScore}`} />
    </div>
  );
}
