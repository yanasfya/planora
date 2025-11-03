"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import type { TripDocument } from "@/lib/zod-schemas";
import { formatCurrency } from "@/lib/utils";

const COLORS = ["#6366f1", "#22d3ee", "#f97316", "#ec4899", "#10b981", "#facc15"];

export function BudgetChart({ trip }: { trip: TripDocument }) {
  const data = trip.budget.breakdown.map((item) => ({
    name: item.category,
    value: item.amount
  }));

  return (
    <div className="rounded-3xl border border-border/60 bg-card p-6">
      <h3 className="font-display text-lg">Budget overview</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Track spend allocation across the trip.
      </p>
      <div className="mt-6 h-64 w-full">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={70} outerRadius={100} paddingAngle={6}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatCurrency(value, trip.budget.currency)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-6 grid gap-3 text-sm">
        {data.map((entry, index) => (
          <div key={entry.name} className="flex items-center justify-between rounded-2xl bg-secondary/50 px-4 py-3">
            <div className="flex items-center gap-3">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span>{entry.name}</span>
            </div>
            <span className="font-semibold">{formatCurrency(entry.value, trip.budget.currency)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
