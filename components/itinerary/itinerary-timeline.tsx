"use client";

import { useState } from "react";
import type { TripDocument } from "@/lib/zod-schemas";
import { cn } from "@/lib/utils";

const categoryColors: Record<string, string> = {
  dining: "bg-rose-500/15 text-rose-500",
  culture: "bg-violet-500/15 text-violet-500",
  nature: "bg-emerald-500/15 text-emerald-600",
  food: "bg-amber-500/15 text-amber-500",
  beverage: "bg-sky-500/15 text-sky-500",
  transit: "bg-slate-500/15 text-slate-400"
};

interface Props {
  trip: TripDocument;
}

export function ItineraryTimeline({ trip }: Props) {
  const [days, setDays] = useState(trip.itinerary);
  const [activeDay, setActiveDay] = useState(0);

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, itemId: string, dayIndex: number) => {
    event.dataTransfer.setData("text/plain", JSON.stringify({ itemId, dayIndex }));
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>, targetDayIndex: number) => {
    event.preventDefault();
    const payload = JSON.parse(event.dataTransfer.getData("text/plain")) as { itemId: string; dayIndex: number };
    const next = [...days];
    const sourceDay = next[payload.dayIndex];
    const item = sourceDay.items.find((entry) => entry.id === payload.itemId);
    if (!item) return;
    sourceDay.items = sourceDay.items.filter((entry) => entry.id !== payload.itemId);
    next[targetDayIndex].items = [...next[targetDayIndex].items, item];
    setDays(next);
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex flex-none flex-col gap-3 rounded-3xl border border-border/60 bg-card p-4 lg:w-64">
        {days.map((day, index) => (
          <button
            key={day.day}
            onClick={() => setActiveDay(index)}
            className={cn(
              "rounded-2xl px-4 py-3 text-left text-sm transition",
              activeDay === index ? "bg-primary text-primary-foreground shadow" : "bg-secondary/40 text-muted-foreground"
            )}
          >
            <p className="font-semibold">Day {day.day}</p>
            <p className="text-xs">{day.summary}</p>
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-4">
        {days[activeDay].items.length === 0 && (
          <div className="rounded-3xl border border-dashed border-primary/40 bg-primary/5 p-8 text-center text-sm text-muted-foreground">
            Drag activities here to build the day.
          </div>
        )}
        <div
          className="space-y-4"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => onDrop(event, activeDay)}
        >
          {days[activeDay].items.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={(event) => onDragStart(event, item.id, activeDay)}
              className="group flex cursor-grab items-center justify-between rounded-3xl border border-border/70 bg-card/90 px-5 py-4 transition hover:border-primary/60"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-secondary/60 px-3 py-2 text-sm font-medium text-muted-foreground">
                  {item.time}
                </div>
                <div>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.location}</p>
                </div>
              </div>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  categoryColors[item.category] ?? "bg-secondary/50 text-muted-foreground"
                )}
              >
                {item.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
