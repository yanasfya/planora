"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";

import type { ItineraryResponse } from "@/lib/trip-store";

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

const groupTypes = [
  { label: "Solo", value: "solo" },
  { label: "Couple", value: "couple" },
  { label: "Family", value: "family" },
  { label: "Friends", value: "friends" },
] as const;

const budgetLevels = [
  { label: "Saver", value: "saver" },
  { label: "Smart", value: "smart" },
  { label: "Luxe", value: "luxe" },
] as const;

const accommodationStyles = [
  { label: "Modern comfort", value: "modern" },
  { label: "Local charm", value: "local" },
  { label: "Luxury resort", value: "resort" },
] as const;

const interestOptions = [
  { label: "Food & drink", value: "food" },
  { label: "Culture & history", value: "culture" },
  { label: "Nature & outdoors", value: "nature" },
  { label: "Nightlife", value: "nightlife" },
  { label: "Art & design", value: "art" },
  { label: "Relaxation", value: "relaxation" },
  { label: "Shopping", value: "shopping" },
  { label: "Family fun", value: "family-fun" },
] as const;

type GroupTypeValue = (typeof groupTypes)[number]["value"];
type BudgetValue = (typeof budgetLevels)[number]["value"];
type AccommodationValue = (typeof accommodationStyles)[number]["value"];

type TripFormValues = {
  destination: string;
  startDate: string;
  endDate: string;
  groupType: GroupTypeValue;
  budget: BudgetValue;
  accommodation: AccommodationValue;
  interests: string[];
  specialRequests: string;
};

type TripFormErrors = Partial<Record<keyof TripFormValues, string>>;

const defaultValues: TripFormValues = {
  destination: "",
  startDate: "",
  endDate: "",
  groupType: groupTypes[0]?.value ?? "solo",
  budget: budgetLevels[1]?.value ?? "smart",
  accommodation: accommodationStyles[0]?.value ?? "modern",
  interests: [],
  specialRequests: "",
};

const enumValues = {
  groupType: new Set(groupTypes.map((option) => option.value)),
  budget: new Set(budgetLevels.map((option) => option.value)),
  accommodation: new Set(accommodationStyles.map((option) => option.value)),
} as const;

const valueLabel = (
  value: string,
  options: readonly { label: string; value: string }[],
) => options.find((option) => option.value === value)?.label ?? "—";

const formatDate = (value?: string) => {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
};

const validateField = <Key extends keyof TripFormValues>(
  key: Key,
  values: TripFormValues,
): TripFormErrors[Key] => {
  switch (key) {
    case "destination":
      if (!values.destination.trim()) {
        return "Destination is required" as TripFormErrors[Key];
      }
      break;
    case "startDate":
      if (!values.startDate) {
        return "Start date is required" as TripFormErrors[Key];
      }
      break;
    case "endDate":
      if (!values.endDate) {
        return "End date is required" as TripFormErrors[Key];
      }
      if (
        values.startDate &&
        values.endDate &&
        new Date(values.endDate) < new Date(values.startDate)
      ) {
        return "End date must be after the start date" as TripFormErrors[Key];
      }
      break;
    case "groupType":
      if (!enumValues.groupType.has(values.groupType)) {
        return "Select who is traveling" as TripFormErrors[Key];
      }
      break;
    case "budget":
      if (!enumValues.budget.has(values.budget)) {
        return "Choose a budget level" as TripFormErrors[Key];
      }
      break;
    case "accommodation":
      if (!enumValues.accommodation.has(values.accommodation)) {
        return "Choose an accommodation style" as TripFormErrors[Key];
      }
      break;
    case "specialRequests":
      if (values.specialRequests && values.specialRequests.length > 500) {
        return "Special requests must be 500 characters or fewer" as TripFormErrors[Key];
      }
      break;
    default:
      break;
  }

  return undefined;
};

const validateTripForm = (values: TripFormValues): TripFormErrors => {
  const result: TripFormErrors = {};

  (Object.keys(values) as (keyof TripFormValues)[]).forEach((field) => {
    const error = validateField(field, values);

    if (error) {
      result[field] = error;
    }
  });

  return result;
};

export default function Page() {
  const [formValues, setFormValues] = useState<TripFormValues>(defaultValues);
  const [errors, setErrors] = useState<TripFormErrors>({});
  const [itinerary, setItinerary] = useState<ItineraryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const selectedInterests = formValues.interests;

  const updateField = <Key extends keyof TripFormValues>(
    key: Key,
    value: TripFormValues[Key],
  ) => {
    setFormValues((previous) => {
      const next = { ...previous, [key]: value } as TripFormValues;

      setErrors((previousErrors) => {
        const nextErrors: TripFormErrors = { ...previousErrors };
        const fieldError = validateField(key, next);

        if (fieldError) {
          nextErrors[key] = fieldError;
        } else {
          delete nextErrors[key];
        }

        if (key === "startDate" || key === "endDate") {
          const otherField = key === "startDate" ? "endDate" : "startDate";
          const otherError = validateField(otherField, next);

          if (otherError) {
            nextErrors[otherField] = otherError;
          } else {
            delete nextErrors[otherField];
          }
        }

        return nextErrors;
      });

      return next;
    });
  };

  const handleBlur = (key: keyof TripFormValues) => {
    setErrors((previousErrors) => {
      const nextErrors: TripFormErrors = { ...previousErrors };
      const fieldError = validateField(key, formValues);

      if (fieldError) {
        nextErrors[key] = fieldError;
      } else {
        delete nextErrors[key];
      }

      if (key === "startDate" || key === "endDate") {
        const otherField = key === "startDate" ? "endDate" : "startDate";
        const otherError = validateField(otherField, formValues);

        if (otherError) {
          nextErrors[otherField] = otherError;
        } else {
          delete nextErrors[otherField];
        }
      }

      return nextErrors;
    });
  };

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value } = event.target;
    const field = id as keyof TripFormValues;

    updateField(field, value as TripFormValues[keyof TripFormValues]);
  };

  const toggleInterest = (value: string) => {
    setFormValues((previous) => {
      const current = previous.interests;
      const exists = current.includes(value);
      const nextInterests = exists
        ? current.filter((item) => item !== value)
        : [...current, value];
      const next = { ...previous, interests: nextInterests };

      setErrors((previousErrors) => {
        const nextErrors: TripFormErrors = { ...previousErrors };
        delete nextErrors.interests;
        return nextErrors;
      });

      return next;
    });
  };

  const handleSegmentChange = <Key extends keyof TripFormValues>(
    key: Key,
    value: string,
  ) => {
    updateField(key, value as TripFormValues[Key]);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validation = validateTripForm(formValues);
    setErrors(validation);

    const hasErrors = Object.values(validation).some(Boolean);

    if (hasErrors) {
      return;
    }

    setLoading(true);
    setFetchError(null);
    setItinerary(null);

    try {
      const destination = formValues.destination.trim();
      const budgetLabel = valueLabel(formValues.budget, budgetLevels);
      const groupTypeLabel = valueLabel(formValues.groupType, groupTypes);
      const accommodationLabel = valueLabel(
        formValues.accommodation,
        accommodationStyles,
      );
      const specialRequests = formValues.specialRequests.trim();
      const interestLabels = formValues.interests
        .map((interest) => valueLabel(interest, interestOptions))
        .filter((label) => label !== "—");

      const payload = {
        destination,
        startDate: formValues.startDate,
        endDate: formValues.endDate,
        budget: budgetLabel === "—" ? formValues.budget : budgetLabel,
        interests: interestLabels,
        ...(groupTypeLabel !== "—" ? { groupType: groupTypeLabel } : {}),
        ...(accommodationLabel !== "—"
          ? { accommodation: accommodationLabel }
          : {}),
        ...(specialRequests ? { specialRequests } : {}),
      };

      const response = await fetch("/api/itinerary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) as
        | {
            error?: unknown;
            fieldErrors?: Record<string, string[] | undefined>;
            itinerary?: ItineraryResponse;
            [key: string]: unknown;
          }
        | null;

      if (!response.ok) {
        if (data?.fieldErrors) {
          setErrors((previous) => {
            const nextErrors: TripFormErrors = { ...previous };

            for (const [key, messages] of Object.entries(data.fieldErrors ?? {})) {
              if (
                key in defaultValues &&
                Array.isArray(messages) &&
                messages.length > 0
              ) {
                nextErrors[key as keyof TripFormValues] = messages[0];
              }
            }

            return nextErrors;
          });
        }

        const errorMessage =
          typeof data?.error === "string"
            ? data.error
            : "We couldn't generate an itinerary right now. Please try again in a moment.";

        throw new Error(errorMessage);
      }

      if (!data) {
        throw new Error(
          "We couldn't process the itinerary response. Please try again shortly.",
        );
      }

      setItinerary((data.itinerary ?? data) as ItineraryResponse);
    } catch (error) {
      setFetchError(
        error instanceof Error
          ? error.message
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
    <main className="relative min-h-dvh overflow-hidden bg-[#f6f7fb]">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 top-24 h-72 w-72 rounded-full bg-[#dbeafe] blur-3xl" />
        <div className="absolute bottom-16 right-[-5rem] h-80 w-80 rounded-full bg-[#e9d5ff] blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#f8faff]/80 via-[#eef2ff]/60 to-[#f1f5ff]/80" />
      </div>

      <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-8 px-6 py-8 lg:px-10 lg:py-12">
        <header className="flex items-center justify-between gap-4 rounded-3xl border border-white/60 bg-white/80 px-6 py-4 shadow-lg shadow-black/5 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black text-white">
              <span className="text-lg font-semibold">P</span>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Planora</p>
              <h1 className="text-lg font-semibold text-zinc-900">Create Your Trip</h1>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-zinc-500 lg:flex">
            <span className="font-medium text-zinc-900">Create Trip</span>
            <span>Saved Itineraries</span>
            <span>Support</span>
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-600 sm:flex">
              <span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
              <span>API healthy</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-700">
              <span>SK</span>
            </div>
          </div>
        </header>

        <section className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/75 px-8 py-10 shadow-lg shadow-black/5">
          <div className="pointer-events-none absolute -top-32 -right-12 h-72 w-72 rounded-full bg-[#d1d9ff]/60 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-16 h-64 w-64 rounded-full bg-[#fde68a]/40 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-center">
            <div className="space-y-5">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-500">
                Trip Planner
              </p>
              <h2 className="text-3xl font-semibold text-zinc-900 sm:text-4xl">
                Shape a getaway that mirrors your travel style
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-zinc-600">
                Plug in the basics, define your vibe, and let Planora craft a multi-day itinerary with balanced pacing, local gems, and thoughtful recommendations.
              </p>
            </div>
            <div className="hidden h-full rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-white p-6 text-sm text-indigo-700 shadow-inner lg:flex lg:flex-col lg:justify-between">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-400">
                  What&apos;s included
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-3">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-semibold text-indigo-500">
                      1
                    </span>
                    <span>Daily highlights with morning, afternoon, and evening anchors.</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-semibold text-indigo-500">
                      2
                    </span>
                    <span>Recommendations shaped by your group type, budget, and interests.</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-semibold text-indigo-500">
                      3
                    </span>
                    <span>Fallback itinerary ready even if the AI service is momentarily unavailable.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 flex items-center gap-3 rounded-2xl border border-indigo-200 bg-white/70 px-4 py-3 text-indigo-600">
                <span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium">Itinerary service status: Ready</span>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-1 flex-col gap-6 pb-8 lg:flex-row">
          <Card className="flex w-full flex-col gap-6 border-white/70 bg-white/80 p-8 shadow-md shadow-black/5 lg:max-w-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-semibold text-zinc-900">Trip preferences</CardTitle>
              <p className="text-sm text-zinc-500">
                Tell us about your upcoming adventure so we can build a personalized itinerary.
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              <form className="space-y-8" onSubmit={handleSubmit} noValidate>
                <section className="space-y-4">
                  <div>
                    <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                      Destination
                    </h2>
                    <p className="text-sm text-zinc-500">Where do you want to go?</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destination">City or region*</Label>
                    <Input
                      id="destination"
                      placeholder="e.g. Kyoto, Japan"
                      value={formValues.destination}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur("destination")}
                    />
                    {errors.destination ? (
                      <p className="text-xs text-red-600">{errors.destination}</p>
                    ) : null}
                  </div>
                </section>

                <section className="space-y-4">
                  <div>
                    <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                      Travel Dates
                    </h2>
                    <p className="text-sm text-zinc-500">When will you be traveling?</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start date*</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formValues.startDate}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur("startDate")}
                      />
                      {errors.startDate ? (
                        <p className="text-xs text-red-600">{errors.startDate}</p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End date*</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formValues.endDate}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur("endDate")}
                      />
                      {errors.endDate ? (
                        <p className="text-xs text-red-600">{errors.endDate}</p>
                      ) : null}
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div>
                    <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                      Travel Details
                    </h2>
                    <p className="text-sm text-zinc-500">
                      Help us understand who you&apos;re traveling with and the vibe you&apos;re after.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Who&apos;s going?</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {groupTypes.map((option) => (
                          <PillOption
                            key={option.value}
                            active={formValues.groupType === option.value}
                            label={option.label}
                            onClick={() => handleSegmentChange("groupType", option.value)}
                          />
                        ))}
                      </div>
                      {errors.groupType ? (
                        <p className="text-xs text-red-600">{errors.groupType}</p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Label>Budget per traveler</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {budgetLevels.map((option) => (
                          <PillOption
                            key={option.value}
                            active={formValues.budget === option.value}
                            label={option.label}
                            onClick={() => handleSegmentChange("budget", option.value)}
                          />
                        ))}
                      </div>
                      {errors.budget ? (
                        <p className="text-xs text-red-600">{errors.budget}</p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Label>Accommodation vibe</Label>
                      <div className="grid gap-2 sm:grid-cols-3">
                        {accommodationStyles.map((option) => (
                          <PillOption
                            key={option.value}
                            active={formValues.accommodation === option.value}
                            label={option.label}
                            onClick={() => handleSegmentChange("accommodation", option.value)}
                          />
                        ))}
                      </div>
                      {errors.accommodation ? (
                        <p className="text-xs text-red-600">{errors.accommodation}</p>
                      ) : null}
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div>
                    <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                      Interests & Preferences
                    </h2>
                    <p className="text-sm text-zinc-500">
                      What should we prioritize when building your itinerary?
                    </p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {interestOptions.map((option) => (
                      <PillOption
                        key={option.value}
                        active={selectedInterests.includes(option.value)}
                        className="text-left"
                        label={option.label}
                        onClick={() => toggleInterest(option.value)}
                      />
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialRequests">Special requirements</Label>
                    <Textarea
                      id="specialRequests"
                      placeholder="Dietary needs, accessibility notes, must-see spots, etc."
                      rows={3}
                      value={formValues.specialRequests}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur("specialRequests")}
                    />
                    <p className="text-xs text-zinc-500">
                      Optional — share anything else that would make your trip unforgettable.
                    </p>
                    {errors.specialRequests ? (
                      <p className="text-xs text-red-600">{errors.specialRequests}</p>
                    ) : null}
                  </div>
                </section>

                {fetchError ? (
                  <p className="rounded-3xl bg-red-50 px-5 py-3 text-sm text-red-600">{fetchError}</p>
                ) : null}

                <Button className="w-full" disabled={loading} type="submit">
                  {loading ? "Generating itinerary…" : "Generate itinerary"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="flex flex-1 flex-col gap-6">
            <Card className="relative overflow-hidden border-white/70 bg-white/85 p-6 shadow-md shadow-black/5">
              <div className="pointer-events-none absolute -top-24 -right-16 h-48 w-48 rounded-full bg-[#fee2f2]/60 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 left-10 h-40 w-40 rounded-full bg-[#dbeafe]/50 blur-3xl" />
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl font-semibold text-zinc-900">Trip Summary</CardTitle>
                <p className="text-sm text-zinc-500">
                  Review the details you&apos;ve shared before generating your itinerary.
                </p>
              </CardHeader>
              <CardContent className="relative space-y-5">
                <SummaryItem
                  label="Destination"
                  value={formValues.destination || "Add a destination"}
                  muted={!formValues.destination}
                />
                <SummaryItem
                  label="Dates"
                  value={`${formatDate(formValues.startDate)} – ${formatDate(formValues.endDate)}`}
                  muted={!formValues.startDate || !formValues.endDate}
                />
                <SummaryItem
                  label="Travelers"
                  value={valueLabel(formValues.groupType, groupTypes)}
                />
                <SummaryItem
                  label="Budget"
                  value={valueLabel(formValues.budget, budgetLevels)}
                />
                <SummaryItem
                  label="Accommodation"
                  value={valueLabel(formValues.accommodation, accommodationStyles)}
                />
                <div className="space-y-3">
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Interests</h3>
                  {formValues.interests && formValues.interests.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {formValues.interests.map((interest) => (
                        <Badge
                          key={interest}
                          className="rounded-full border-transparent bg-black/90 px-3 py-1 text-xs font-medium text-white"
                        >
                          {valueLabel(interest, interestOptions)}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-500">Add interests to tailor your plan.</p>
                  )}
                </div>
                <div className="space-y-3">
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    Special requirements
                  </h3>
                  <div className="rounded-2xl border border-zinc-100 bg-white/60 px-4 py-3">
                    <p className="text-sm text-zinc-600">
                      {formValues.specialRequests.trim().length
                        ? formValues.specialRequests
                        : "None added yet."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="flex-1 border-white/70 bg-white/80 p-6 shadow-md shadow-black/5 lg:sticky lg:top-24 lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-zinc-900">
                  {loading ? "Generating your itinerary" : "Itinerary"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {loading ? (
                  <div className="space-y-3">
                    <div className="h-4 w-3/4 animate-pulse rounded-full bg-zinc-200" />
                    <div className="h-4 w-2/3 animate-pulse rounded-full bg-zinc-200" />
                    <div className="h-4 w-5/6 animate-pulse rounded-full bg-zinc-200" />
                  </div>
                ) : null}

                {!loading && !itinerary ? (
                  <p className="text-sm text-zinc-500">
                    Share your preferences and generate to see a day-by-day plan curated just for you.
                  </p>
                ) : null}

                {!loading && itinerary ? (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-zinc-900">
                        {itinerary.destination ?? "Your custom itinerary"}
                      </h3>
                      <p className="text-sm text-zinc-500">
                        {itinerary.duration ?? `${formatDate(formValues.startDate)} → ${formatDate(formValues.endDate)}`}
                      </p>
                      {interestBadges.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {interestBadges.map((interest) => (
                            <Badge
                              key={interest}
                              className="rounded-full border-transparent bg-black/90 px-3 py-1 text-xs font-medium text-white"
                            >
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    {itinerary.overview || itinerary.summary ? (
                      <p className="text-sm text-zinc-600">
                        {(itinerary.overview ?? itinerary.summary) as string}
                      </p>
                    ) : null}

                    {itinerary.travelerProfile ? (
                      <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4">
                        <p className="text-sm text-zinc-600">
                          {itinerary.travelerProfile}
                        </p>
                      </div>
                    ) : null}

                    {itinerary.specialRequests ? (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-800">
                        <p className="font-semibold uppercase tracking-[0.18em] text-amber-600">
                          Special notes
                        </p>
                        <p className="mt-2 leading-relaxed text-amber-800">
                          {itinerary.specialRequests}
                        </p>
                      </div>
                    ) : null}

                    {itinerary.tips && itinerary.tips.length > 0 ? (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-zinc-800">Tips</h4>
                        <ul className="list-inside list-disc space-y-1 text-sm text-zinc-600">
                          {itinerary.tips.map((tip, index) => (
                            <li key={`${tip}-${index}`}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {itinerary.days && itinerary.days.length > 0 ? (
                      <div className="space-y-4">
                        {itinerary.days.map((day, index) => (
                          <Card key={day.title ?? index} className="border-zinc-200 bg-white p-4">
                            <CardHeader className="space-y-1">
                              <CardTitle className="text-base font-semibold text-zinc-900">
                                {day.title ?? `Day ${index + 1}`}
                              </CardTitle>
                              {day.date ? (
                                <p className="text-xs text-zinc-500">{day.date}</p>
                              ) : null}
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm text-zinc-600">
                              {day.summary ? <p>{day.summary}</p> : null}

                              {day.activities && day.activities.length > 0 ? (
                                <ul className="space-y-3">
                                  {day.activities.map((activity, activityIndex) => (
                                    <li
                                      key={activity.title ?? activityIndex}
                                      className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
                                    >
                                      <div className="flex flex-col gap-1">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                          {activity.title ? (
                                            <span className="text-sm font-medium text-zinc-800">
                                              {activity.title}
                                            </span>
                                          ) : null}
                                          {activity.time ? (
                                            <Badge className="bg-white text-zinc-600">{activity.time}</Badge>
                                          ) : null}
                                        </div>
                                        {activity.description ? (
                                          <p className="text-sm text-zinc-600">{activity.description}</p>
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
                      <Card className="border-zinc-200 bg-zinc-50 p-4">
                        <CardHeader>
                          <CardTitle className="text-base font-semibold text-zinc-900">
                            Itinerary details
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-zinc-600">
                            We couldn’t find structured daily plans in the response. Here’s the full payload instead:
                          </p>
                          <pre className="overflow-x-auto rounded-2xl bg-zinc-900 p-4 text-xs text-zinc-100">
                            {JSON.stringify(itinerary, null, 2)}
                          </pre>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

type PillOptionProps = {
  label: string;
  active: boolean;
  onClick: () => void;
  className?: string;
};

const PillOption = ({ label, active, onClick, className }: PillOptionProps) => (
  <button
    aria-pressed={active}
    className={`rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black data-[active=true]:border-black data-[active=true]:bg-black data-[active=true]:text-white data-[active=true]:shadow-lg data-[active=true]:shadow-black/10 ${className ?? ""}`}
    data-active={active}
    onClick={onClick}
    type="button"
  >
    {label}
  </button>
);

type SummaryItemProps = {
  label: string;
  value: string;
  muted?: boolean;
};

const SummaryItem = ({ label, value, muted = false }: SummaryItemProps) => (
  <div className="flex items-center justify-between gap-6 rounded-2xl border border-zinc-100 bg-white/60 px-5 py-4">
    <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">{label}</h3>
    <p
      className={`text-sm font-medium ${
        muted ? "text-zinc-400" : "text-zinc-900"
      }`}
    >
      {value}
    </p>
  </div>
);
