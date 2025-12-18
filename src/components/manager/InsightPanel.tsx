export default function InsightPanel({
  topFailTags,
  actions,
}: {
  topFailTags: { tag: string; count: number }[];
  actions: { repId?: string; repName?: string; issue: string; recommendation: string; impact?: string; goal?: string; why?: string }[];
}) {
  return (
    <div className="rounded-2xl border p-4 shadow-sm space-y-4">
      <div>
        <div className="font-medium">Top issues</div>
        <div className="text-sm text-muted-foreground">What’s dragging scores down</div>
        <div className="mt-3 space-y-2">
          {topFailTags.slice(0, 5).map((x) => (
            <div key={x.tag} className="flex items-center justify-between text-sm">
              <span className="capitalize">{x.tag.replaceAll("_", " ")}</span>
              <span className="text-muted-foreground">{x.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="font-medium">Recommended coaching actions</div>
        <div className="mt-3 space-y-3">
          {actions.map((a) => (
            <div key={`${a.repId ?? "team"}-${a.issue}`} className="rounded-xl border p-3">
              <div className="text-sm font-medium capitalize">{a.issue.replaceAll("_", " ")}</div>
              <div className="text-sm text-muted-foreground mt-1">{a.recommendation}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
