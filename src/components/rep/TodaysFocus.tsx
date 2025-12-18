export default function TodaysFocus({
  focus,
  drill,
  goal,
}: {
  focus: string;
  drill: string;
  goal: string;
}) {
  return (
    <div className="rounded-2xl border p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs text-muted-foreground">Today’s focus</div>
          <div className="mt-1 text-lg font-semibold capitalize">{focus}</div>
          <div className="mt-2 text-sm text-muted-foreground">{drill}</div>
        </div>

        <a
          href="#practice"
          className="rounded-xl border px-3 py-2 text-sm font-medium shadow-sm hover:bg-muted"
        >
          Start drill
        </a>
      </div>

      <div className="mt-4 rounded-xl bg-muted/40 p-3">
        <div className="text-xs text-muted-foreground">Goal</div>
        <div className="mt-1 text-sm">{goal}</div>
      </div>
    </div>
  );
}
