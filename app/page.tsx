"use client";

import { useMemo, useState } from "react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
} from "./(pwa)/components/ui";

type Activity = {
  title?: string;
  time?: string;
  description?: string;
};

type DayPlan = {
  title?: string;
  date?: string;
  summary?: string;
  activities?: Activity[];
};

type ItineraryResponse = {
  destination?: string;
  duration?: string;
  budget?: string;
  interests?: string[];
  overview?: string;
  summary?: string;
  tips?: string[];
  days?: DayPlan[];
  [key: string]: unknown;
};

const initialForm = {
  destination: "",
  startDate: "",
  endDate: "",
  budget: "",
  interests: "",
};

export default function Page() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryResponse | null>(null);

  const formIsValid = useMemo(() => {
    return (
      form.destination.trim().length > 0 &&
      form.startDate.trim().length > 0 &&
      form.endDate.trim().length > 0 &&
      form.budget.trim().length > 0
    );
  }, [form]);

  const handleChange = (
    field: keyof typeof initialForm,
    value: string,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetItinerary = () => {
    setItinerary(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formIsValid) {
      setError("Please fill in all required fields before submitting.");
      return;
    }

    setLoading(true);
    setError(null);
    resetItinerary();

    try {
      const payload = {
        destination: form.destination.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        budget: form.budget.trim(),
        interests: form.interests
          .split(/[,\n]/)
          .map((interest) => interest.trim())
          .filter(Boolean),
      };

      const response = await fetch("/api/itinerary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          "We couldn't generate an itinerary right now. Please try again in a moment.",
        );
      }

      const data = await response.json();
      const resolved = (data?.itinerary ?? data) as ItineraryResponse;

      setItinerary(resolved);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "An unexpected error occurred. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const interestBadges = useMemo(() => {
    if (!itinerary?.interests || !Array.isArray(itinerary.interests)) {
      return [] as string[];
    }

    return itinerary.interests.filter((interest): interest is string =>
      typeof interest === "string" && interest.trim().length > 0,
    );
  }, [itinerary]);

  return (
    <main className="min-h-dvh bg-gradient-to-b from-white to-zinc-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 lg:flex-row lg:py-16">
        <section className="w-full lg:max-w-sm">
          <Card className="lg:sticky lg:top-8">
            <CardHeader>
              <CardTitle>Create your itinerary</CardTitle>
              <p className="text-sm text-zinc-600">
                Share where you want to go, when you’re traveling, your budget, and
                what you love. We’ll craft a tailored plan for you.
              </p>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination*</Label>
                  <Input
                    id="destination"
                    placeholder="e.g. Kyoto, Japan"
                    value={form.destination}
                    onChange={(event) => handleChange("destination", event.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start date*</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={form.startDate}
                      onChange={(event) => handleChange("startDate", event.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End date*</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={form.endDate}
                      onChange={(event) => handleChange("endDate", event.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (per traveler)*</Label>
                  <Input
                    id="budget"
                    placeholder="e.g. $1,500"
                    value={form.budget}
                    onChange={(event) => handleChange("budget", event.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interests">Interests & priorities</Label>
                  <Textarea
                    id="interests"
                    placeholder="List anything you care about: museums, coffee shops, hiking, etc."
                    value={form.interests}
                    onChange={(event) => handleChange("interests", event.target.value)}
                  />
                  <p className="text-xs text-zinc-500">
                    Separate interests with commas or line breaks for best results.
                  </p>
                </div>

                {error ? (
                  <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </p>
                ) : null}

                <Button className="w-full" disabled={loading || !formIsValid} type="submit">
                  {loading ? "Generating itinerary…" : "Generate itinerary"}
                </Button>

                <p className="text-center text-xs text-zinc-500">
                  Need to confirm the API? Check the{" "}
                  <a className="underline" href="/api/health">
                    health endpoint
                  </a>
                  .
                </p>
              </form>
            </CardContent>
          </Card>
        </section>

        <section className="flex-1 space-y-6">
          {!loading && !itinerary ? (
            <Card className="border-dashed border-zinc-300 bg-white/40 text-center text-sm text-zinc-600">
              <CardHeader>
                <CardTitle>Your itinerary will appear here</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Submit the form to see a daily breakdown tailored to your trip. We’ll
                  include activities, dining ideas, and insider tips once the plan is
                  generated.
                </p>
              </CardContent>
            </Card>
          ) : null}

          {loading ? (
            <Card className="border-dashed border-zinc-300 bg-white/60">
              <CardHeader>
                <CardTitle>Generating your plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 w-3/4 animate-pulse rounded-full bg-zinc-200" />
                  <div className="h-4 w-2/3 animate-pulse rounded-full bg-zinc-200" />
                  <div className="h-4 w-1/2 animate-pulse rounded-full bg-zinc-200" />
                </div>
              </CardContent>
            </Card>
          ) : null}

          {itinerary ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <CardTitle>
                        {itinerary.destination ?? "Your custom itinerary"}
                      </CardTitle>
                      <p className="text-sm text-zinc-600">
                        {itinerary.duration ?? `${form.startDate} → ${form.endDate}`}
                      </p>
                    </div>
                    {interestBadges.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {interestBadges.map((interest) => (
                          <Badge key={interest}>{interest}</Badge>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent>
                  {itinerary.overview || itinerary.summary ? (
                    <p className="text-base text-zinc-700">
                      {(itinerary.overview ?? itinerary.summary) as string}
                    </p>
                  ) : null}

                  {itinerary.tips && itinerary.tips.length > 0 ? (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-zinc-800">
                        Tips
                      </h4>
                      <ul className="list-inside list-disc space-y-1 text-sm text-zinc-600">
                        {itinerary.tips.map((tip, index) => (
                          <li key={`${tip}-${index}`}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              {itinerary.days && itinerary.days.length > 0 ? (
                <div className="space-y-4">
                  {itinerary.days.map((day, index) => (
                    <Card key={day.title ?? index}>
                      <CardHeader>
                        <CardTitle>
                          {day.title ?? `Day ${index + 1}`}
                        </CardTitle>
                        {day.date ? (
                          <p className="text-sm text-zinc-500">{day.date}</p>
                        ) : null}
                      </CardHeader>
                      <CardContent>
                        {day.summary ? (
                          <p className="text-sm text-zinc-600">{day.summary}</p>
                        ) : null}

                        {day.activities && day.activities.length > 0 ? (
                          <ul className="space-y-3">
                            {day.activities.map((activity, activityIndex) => (
                              <li className="rounded-2xl bg-zinc-50 p-4" key={activity.title ?? activityIndex}>
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center justify-between gap-3">
                                    {activity.title ? (
                                      <span className="text-sm font-medium text-zinc-800">
                                        {activity.title}
                                      </span>
                                    ) : null}
                                    {activity.time ? (
                                      <Badge className="bg-white text-zinc-600">
                                        {activity.time}
                                      </Badge>
                                    ) : null}
                                  </div>
                                  {activity.description ? (
                                    <p className="text-sm text-zinc-600">
                                      {activity.description}
                                    </p>
                                  ) : null}
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : null}

              {(!itinerary.days || itinerary.days.length === 0) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Itinerary details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-zinc-600">
                      We couldn’t find structured daily plans in the response. Here’s the
                      full payload instead:
                    </p>
                    <pre className="overflow-x-auto rounded-2xl bg-zinc-900 p-4 text-xs text-zinc-100">
                      {JSON.stringify(itinerary, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
