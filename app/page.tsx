"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PrefsSchema, type Prefs, type Itinerary } from "@lib/types";
import { useState } from "react";

export default function Page() {
  const [result, setResult] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<Prefs>({
    resolver: zodResolver(PrefsSchema),
    defaultValues: { destination: "", startDate: "", endDate: "", budget: "medium", interests: [] }
  });

const onSubmit = async (data: Prefs) => {
  setLoading(true);
  setResult(null);
  try {
    const r = await fetch("/api/itineraries/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    
    const text = await r.text();
    let j: any = {};
    try { j = text ? JSON.parse(text) : {}; } catch { j = { error: text || "Failed" }; }

    setLoading(false);

    if (!r.ok) {
      alert(j?.error ? JSON.stringify(j.error) : "Failed to generate itinerary");
      return;
    }
    setResult(j);
  } catch (e: any) {
    setLoading(false);
    alert(e?.message ?? "Network error");
  }
};


  return (
    <main className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-semibold">Planora – Itinerary Generator</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-2xl shadow">
        <div>
          <label className="block text-sm mb-1">Destination</label>
          <input {...register("destination")} className="w-full border rounded px-3 py-2" placeholder="Kyoto, Japan" />
          {errors.destination && <p className="text-red-600 text-sm">{String(errors.destination.message)}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Start Date</label>
          <input type="date" {...register("startDate")} className="w-full border rounded px-3 py-2" />
          {errors.startDate && <p className="text-red-600 text-sm">{String(errors.startDate.message)}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">End Date</label>
          <input type="date" {...register("endDate")} className="w-full border rounded px-3 py-2" />
          {errors.endDate && <p className="text-red-600 text-sm">{String(errors.endDate.message)}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Budget</label>
          <select {...register("budget")} className="w-full border rounded px-3 py-2">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Interests (comma separated)</label>
          <input
            {...register("interests", { setValueAs: (v) => String(v).split(",").map((s) => s.trim()).filter(Boolean) })}
            className="w-full border rounded px-3 py-2"
            placeholder="food, culture, nature"
          />
        </div>
        <button className="md:col-span-2 inline-flex items-center justify-center rounded-xl border px-4 py-2 bg-gray-900 text-white disabled:opacity-50" disabled={loading}>
          {loading ? "Generating..." : "Generate Itinerary"}
        </button>
      </form>

      {result && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Plan</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {result.days.map((d) => (
              <div key={d.day} className="bg-white rounded-2xl shadow p-4">
                <h3 className="font-semibold">Day {d.day}</h3>
                {d.summary && <p className="text-sm text-gray-600 mb-2">{d.summary}</p>}
                <ul className="space-y-2">
                  {d.activities.map((a, i) => (
                    <li key={i} className="text-sm">
                      <div className="font-medium">{a.time} — {a.title}</div>
                      <div className="text-gray-600">{a.location}</div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
