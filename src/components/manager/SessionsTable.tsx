type SessionRow = {
  startedAt: string;
  endedAt: string;
  repId: string;
  repName: string;
  rounds: number;
  sessionScore: number;
  topFailTags?: { tag: string; count: number }[];
};

function fmt(dt: string) {
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return dt;
  return d.toLocaleString();
}

export default function SessionsTable({ sessions }: { sessions: SessionRow[] }) {
  const sorted = [...sessions].sort((a, b) => b.startedAt.localeCompare(a.startedAt));

  return (
    <div className="rounded-2xl border p-4 shadow-sm">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="font-medium">Sessions</div>
          <div className="text-sm text-muted-foreground">Most recent training sessions</div>
        </div>
        <div className="text-sm text-muted-foreground">{sorted.length} total</div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground">
            <tr>
              <th className="py-2">Started</th>
              <th className="py-2">Rep</th>
              <th className="py-2">Rounds</th>
              <th className="py-2">Score</th>
              <th className="py-2">Top issues</th>
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, 12).map((s) => (
              <tr key={`${s.repId}-${s.startedAt}`} className="border-t align-top">
                <td className="py-2">{fmt(s.startedAt)}</td>
                <td className="py-2">{s.repName}</td>
                <td className="py-2">{s.rounds}</td>
                <td className="py-2 font-medium">{s.sessionScore}</td>
                <td className="py-2 text-muted-foreground">
                  {(s.topFailTags ?? []).length
                    ? (s.topFailTags ?? [])
                        .slice(0, 2)
                        .map((t) => t.tag.replaceAll("_", " "))
                        .join(", ")
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
