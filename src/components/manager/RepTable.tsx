export default function RepTable({
  reps,
}: {
  reps: {
    repId: string;
    repName: string;
    attempts: number;
    avgScore: number;
    lastScore: number;
    trend: number;
    topIssue: string | null;
    focus?: string | null;
    drill?: string | null;
    goal?: string | null;
    impact?: string | null;
  }[];
}) {
  return (
    <div className="rounded-2xl border p-4 shadow-sm">
      <div className="font-medium mb-3">Reps</div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground">
            <tr>
              <th className="py-2">Rep</th>
              <th className="py-2">Attempts</th>
              <th className="py-2">Avg</th>
              <th className="py-2">Last</th>
              <th className="py-2">Trend</th>
              <th className="py-2">Top issue</th>
              <th className="py-2">Focus</th>
              <th className="py-2">Drill</th>
              <th className="py-2">Impact</th>
            </tr>
          </thead>
          <tbody>
            {reps.map((r) => (
              <tr key={r.repId} className="border-t align-top">
                <td className="py-2">{r.repName}</td>
                <td className="py-2">{r.attempts}</td>
                <td className="py-2">{r.avgScore}</td>
                <td className="py-2">{r.lastScore}</td>
                <td className="py-2">{r.trend >= 0 ? `+${r.trend}` : r.trend}</td>
                <td className="py-2 capitalize">{r.topIssue ? r.topIssue.replaceAll("_", " ") : "-"}</td>
                <td className="py-2 capitalize">{r.focus ?? "-"}</td>
                <td className="py-2">{r.drill ?? "-"}</td>
                <td className="py-2">{r.impact ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Optional: show goal text below the table */}
        <div className="mt-4 space-y-2">
          {reps
            .filter((r) => r.goal)
            .slice(0, 3)
            .map((r) => (
              <div key={r.repId} className="rounded-xl border p-3">
                <div className="text-sm font-medium">{r.repName} — Goal</div>
                <div className="text-sm text-muted-foreground mt-1">{r.goal}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
