"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function ScoreTrendChart({ trend }: { trend: { day: string; avgScore: number }[] }) {
  return (
    <div className="rounded-2xl border p-4 shadow-sm">
      <div className="font-medium mb-3">Average score trend</div>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <LineChart data={trend}>
            <XAxis dataKey="day" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Line type="monotone" dataKey="avgScore" strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
