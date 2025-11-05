"use client";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PrefsSchema, type Prefs, type Itinerary } from "@lib/types";
import { useState } from "react";

export default function Page() {
  const [result, setResult] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(false);
  const [groupType, setGroupType] = useState("Solo");
  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors } } = useForm<Prefs>({
    resolver: zodResolver(PrefsSchema),
    defaultValues: { destination: "", startDate: "", endDate: "", budget: "medium", interests: [] }
  });

  const popularDestinations = [
    "Tokyo, Japan",
    "Paris, France",
    "New York, USA",
    "Rome, Italy",
    "Barcelona, Spain",
  ];

  const groupTypes = [
    { label: "Solo", value: "Solo" },
    { label: "Couple", value: "Couple" },
    { label: "Family", value: "Family" },
    { label: "Friends", value: "Friends" },
  ];

  const budgetOptions: Record<Prefs["budget"], { label: string; description: string }> = {
    low: { label: "Budget", description: "Cost-effective options" },
    medium: { label: "Moderate", description: "Balance of comfort and value" },
    high: { label: "Luxury", description: "Premium experiences" },
  };

  const interestOptions = [
    "Culture",
    "Food",
    "Nature",
    "Adventure",
    "Relaxation",
    "Art",
    "Beach",
    "Shopping",
  ];

  const interests = watch("interests") ?? [];
  const selectedBudget = watch("budget");
  const destination = watch("destination");
  const startDate = watch("startDate");
  const endDate = watch("endDate");

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
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 pb-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Planora</p>
            <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Create Your Trip</h1>
            <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
              Fill in your preferences to generate a personalized itinerary tailored to your travel style.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-transparent px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700"
            onClick={() => {
              reset();
              setResult(null);
              setGroupType("Solo");
            }}
          >
            Cancel
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <form id="trip-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-slate-900">Destination</h2>
                <p className="text-sm text-slate-600">Where would you like to go? Enter a destination or choose from popular picks.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="destination">Destination</label>
                  <input
                    id="destination"
                    {...register("destination")}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-inner outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    placeholder="Kyoto, Japan"
                  />
                  {errors.destination && <p className="mt-2 text-sm text-rose-500">{String(errors.destination.message)}</p>}
                </div>
              </div>
              <div>
                <p className="mb-3 text-sm font-medium text-slate-700">Popular destinations</p>
                <div className="flex flex-wrap gap-2">
                  {popularDestinations.map((city) => {
                    const isSelected = destination?.toLowerCase() === city.toLowerCase();
                    return (
                      <button
                        type="button"
                        key={city}
                        onClick={() => setValue("destination", city, { shouldDirty: true })}
                        className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition ${
                          isSelected
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        {city}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-slate-900">Travel Dates</h2>
                <p className="text-sm text-slate-600">When are you traveling? Choose a start and end date for your adventure.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="startDate">Start date</label>
                  <input
                    type="date"
                    id="startDate"
                    {...register("startDate")}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-inner outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                  {errors.startDate && <p className="mt-2 text-sm text-rose-500">{String(errors.startDate.message)}</p>}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="endDate">End date</label>
                  <input
                    type="date"
                    id="endDate"
                    {...register("endDate")}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-inner outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                  {errors.endDate && <p className="mt-2 text-sm text-rose-500">{String(errors.endDate.message)}</p>}
                </div>
              </div>
            </section>

            <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-slate-900">Travel Details</h2>
                <p className="text-sm text-slate-600">Who's traveling and what's your budget? Select the options that best describe your trip.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-700">Group type</p>
                  <div className="flex flex-wrap gap-3">
                    {groupTypes.map((group) => {
                      const active = groupType === group.value;
                      return (
                        <button
                          key={group.value}
                          type="button"
                          onClick={() => setGroupType(group.value)}
                          className={`inline-flex items-center justify-center rounded-2xl border px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 ${
                            active
                              ? "border-slate-900 bg-slate-900 text-white"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          {group.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-700">Budget level</p>
                  <div className="grid gap-3 md:grid-cols-3">
                    {(Object.keys(budgetOptions) as Prefs["budget"][]).map((key) => {
                      const budget = budgetOptions[key];
                      const isActive = selectedBudget === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setValue("budget", key, { shouldDirty: true })}
                          className={`rounded-2xl border p-4 text-left shadow-sm transition ${
                            isActive
                              ? "border-slate-900 bg-slate-900 text-white"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          <span className="block text-sm font-semibold">{budget.label}</span>
                          <span className={`mt-2 block text-xs ${isActive ? "text-slate-100" : "text-slate-500"}`}>
                            {budget.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-slate-900">Interests & Preferences</h2>
                <p className="text-sm text-slate-600">Select the activities and themes you enjoy to personalize your itinerary.</p>
              </div>
              <Controller
                name="interests"
                control={control}
                render={({ field }) => {
                  const selected = (field.value ?? []) as string[];
                  const toggleInterest = (value: string) => {
                    const exists = selected.includes(value);
                    const next = exists ? selected.filter((item) => item !== value) : [...selected, value];
                    field.onChange(next);
                  };

                  return (
                    <div className="flex flex-wrap gap-2">
                      {interestOptions.map((interest) => {
                        const active = selected.includes(interest);
                        return (
                          <button
                            key={interest}
                            type="button"
                            onClick={() => toggleInterest(interest)}
                            className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition ${
                              active
                                ? "border-slate-900 bg-slate-900 text-white"
                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                            }`}
                          >
                            {interest}
                          </button>
                        );
                      })}
                    </div>
                  );
                }}
              />
              {errors.interests && <p className="text-sm text-rose-500">{String(errors.interests.message)}</p>}
            </section>
          </form>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Trip Summary</h2>
              <p className="mt-2 text-sm text-slate-600">Review the details of your trip before generating the itinerary.</p>
              <dl className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Destination</dt>
                  <dd className="font-medium text-slate-900">{destination || "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Start date</dt>
                  <dd className="font-medium text-slate-900">{startDate || "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">End date</dt>
                  <dd className="font-medium text-slate-900">{endDate || "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Budget</dt>
                  <dd className="font-medium text-slate-900">{budgetOptions[selectedBudget]?.label ?? "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Group</dt>
                  <dd className="font-medium text-slate-900">{groupType || "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Interests</dt>
                  <dd className="text-right font-medium text-slate-900">
                    {interests.length ? interests.join(", ") : "—"}
                  </dd>
                </div>
              </dl>
              <button
                type="submit"
                form="trip-form"
                disabled={loading}
                className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Generating..." : "Generate Itinerary"}
              </button>
            </div>
          </aside>
        </div>

        {result && (
          <section className="mt-10 space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Your personalized plan</h2>
              <p className="mt-1 text-sm text-slate-600">Here’s a day-by-day guide based on your selections.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {result.days.map((d) => (
                <div key={d.day} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">Day {d.day}</h3>
                  </div>
                  {d.summary && <p className="text-sm text-slate-600">{d.summary}</p>}
                  <ul className="space-y-4 text-sm">
                    {d.activities.map((a, i) => (
                      <li key={i} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-900">{a.title}</span>
                          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{a.time}</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-600">{a.location}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
