import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z
  .object({
    destination: z.string().min(1, "Destination is required").max(120),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    budget: z.string().min(1, "Budget is required").max(60),
    interests: z.array(z.string()).optional(),
  })
  .strict();

const itineraryActivitySchema = z
  .object({
    title: z.string().min(1).optional(),
    time: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
  })
  .passthrough();

const itineraryDaySchema = z
  .object({
    title: z.string().min(1).optional(),
    date: z.string().min(1).optional(),
    summary: z.string().min(1).optional(),
    activities: z.array(itineraryActivitySchema).optional(),
  })
  .passthrough();

const itineraryContentSchema = z
  .object({
    destination: z.string().min(1),
    duration: z.string().min(1),
    budget: z.string().min(1),
    interests: z.array(z.string().min(1)).optional(),
    overview: z.string().min(1).optional(),
    summary: z.string().min(1).optional(),
    tips: z.array(z.string().min(1)).optional(),
    days: z.array(itineraryDaySchema).optional(),
  })
  .passthrough();

const itineraryResponseSchema = z.union([
  z.object({ itinerary: itineraryContentSchema }).passthrough(),
  itineraryContentSchema,
]);

type ItineraryContent = z.infer<typeof itineraryContentSchema>;

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
});

type Segment = { label: string; time: string };

type SpecialInterestExperience = {
  keywords: string[];
  summary: (destination: string) => string;
  activities: {
    label: string;
    title: string;
    description: string;
    time?: string;
  }[];
};

const segments: Segment[] = [
  { label: "Morning", time: "8:30 AM" },
  { label: "Afternoon", time: "1:30 PM" },
  { label: "Evening", time: "7:00 PM" },
];

const specialInterestExperiences: SpecialInterestExperience[] = [
  {
    keywords: ["universal studios", "universal studio", "usj"],
    summary: (destination) =>
      `Plan your day around the headliner attractions at Universal Studios in ${destination}. Prioritize timed-entry areas and blockbuster rides early, then circle back for shows, snacks, and nighttime spectaculars as crowds thin out.`,
    activities: [
      {
        label: "Morning",
        title: "Morning – Early entry into Universal Studios",
        description:
          "Arrive for rope drop so you can head straight to the Wizarding World of Harry Potter or Super Nintendo World. Secure any timed-entry tickets and knock out marquee rides before queues build.",
        time: "8:00 AM",
      },
      {
        label: "Afternoon",
        title: "Afternoon – Shows and signature snacks",
        description:
          "Shift gears to stage shows like WaterWorld or the Universal Monster Live Rock and Roll Show. Refuel with park-exclusive bites—think Minion buns or Butterbeer—while using the official app to monitor wait times.",
        time: "1:00 PM",
      },
      {
        label: "Evening",
        title: "Evening – Nighttime spectaculars and shopping",
        description:
          "Revisit favorite attractions with shorter lines and grab souvenirs along Universal CityWalk. Stake out a spot for the evening parade or lagoon show before wrapping the night with a relaxed dinner nearby.",
        time: "6:30 PM",
      },
    ],
  },
];

type TravelDay = {
  dayNumber: number;
  isoDate: string;
  label: string;
};

type OpenRouterItineraryInput = {
  destination: string;
  budget: string;
  startDate: string;
  endDate: string;
  interests: string[];
  travelDays: TravelDay[];
};

function buildTravelDays(start: Date, end: Date): TravelDay[] {
  const days: TravelDay[] = [];

  for (
    let current = new Date(start), index = 0;
    current <= end;
    current.setDate(current.getDate() + 1), index += 1
  ) {
    days.push({
      dayNumber: index + 1,
      isoDate: current.toISOString().split("T")[0],
      label: dateFormatter.format(current),
    });
  }

  return days;
}

function normalizeInterest(interest: string) {
  return interest.toLowerCase();
}

function findSpecialInterestExperience(interest: string) {
  const normalized = normalizeInterest(interest);
  return specialInterestExperiences.find((experience) =>
    experience.keywords.some((keyword) => normalized.includes(keyword)),
  );
}

function buildDefaultActivities(destination: string) {
  return segments.map((segment) => ({
    title: `${segment.label} adventure`,
    time: segment.time,
    description: `Spend your ${segment.label.toLowerCase()} discovering a new corner of ${destination}. Mix in cafes, museums, or parks based on the vibe you’re feeling.`,
  }));
}

function createActivities(
  destination: string,
  interests: string[],
  dayIndex: number,
) {
  if (interests.length === 0) {
    return buildDefaultActivities(destination);
  }

  return segments.map((segment, segmentIndex) => {
    const interest = interests[(dayIndex + segmentIndex) % interests.length];
    const experience = findSpecialInterestExperience(interest);
    const override = experience?.activities.find(
      (activity) => activity.label === segment.label,
    );

    if (override) {
      return {
        title: override.title,
        time: override.time ?? segment.time,
        description: override.description,
      };
    }

    return {
      title: `${segment.label} – ${interest}`,
      time: segment.time,
      description: `Immerse yourself in ${normalizeInterest(interest)} experiences around ${destination}. Reserve a little time to wander and see what surprises you find.`,
    };
  });
}

function buildDaySummary(
  destination: string,
  interest: string | undefined,
) {
  if (!interest) {
    return `Spend the day exploring local highlights in ${destination}. Balance anchor activities with time to relax and soak in the atmosphere.`;
  }

  const experience = findSpecialInterestExperience(interest);

  if (experience) {
    return experience.summary(destination);
  }

  return `Spend the day exploring ${normalizeInterest(interest)} in ${destination}. Balance anchor activities with time to relax and soak in the atmosphere.`;
}

function buildDayPlans(
  destination: string,
  start: Date,
  end: Date,
  interests: string[],
) {
  const plans: {
    title: string;
    date: string;
    summary: string;
    activities: { title: string; time: string; description: string }[];
  }[] = [];

  for (
    let current = new Date(start), index = 0;
    current <= end;
    current.setDate(current.getDate() + 1), index += 1
  ) {
    const formattedDate = dateFormatter.format(current);
    const focus =
      interests.length > 0 ? interests[index % interests.length] : undefined;

    plans.push({
      title: `Day ${index + 1}`,
      date: formattedDate,
      summary: buildDaySummary(destination, focus),
      activities: createActivities(destination, interests, index),
    });
  }

  return plans;
}

function createFallbackItinerary(
  destination: string,
  budget: string,
  start: Date,
  end: Date,
  interests: string[],
): ItineraryContent {
  const dayPlans = buildDayPlans(destination, start, end, interests);
  const durationInDays = dayPlans.length;

  const interestSummary =
    interests.length > 0
      ? interests.slice(0, 3).join(", ")
      : "a mix of culture, dining, and relaxation";

  return {
    destination,
    duration: `${durationInDays} day${durationInDays === 1 ? "" : "s"}`,
    budget,
    interests,
    overview: `A ${durationInDays}-day escape to ${destination} tailored to a ${budget} budget. Expect a balance of must-see highlights with time to follow your curiosity around ${interestSummary}.`,
    tips: [
      "Block off a little buffer time each day for spontaneous discoveries.",
      "Check opening hours a day ahead—local schedules can shift seasonally.",
      "Bookmark directions offline in case your connection drops while exploring.",
    ],
    days: dayPlans,
  };
}

async function generateItineraryWithOpenRouter(
  input: OpenRouterItineraryInput,
): Promise<ItineraryContent | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return null;
  }

  const model = process.env.OPENROUTER_MODEL ?? "openrouter/auto";
  const siteUrl = process.env.OPENROUTER_SITE_URL ?? "https://planora.app";
  const appName = process.env.OPENROUTER_APP_NAME ?? "Planora";

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(siteUrl ? { "HTTP-Referer": siteUrl } : {}),
      ...(appName ? { "X-Title": appName } : {}),
    },
    body: JSON.stringify({
      model,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "itinerary_response",
          schema: {
            type: "object",
            required: ["itinerary"],
            additionalProperties: true,
            properties: {
              itinerary: {
                type: "object",
                additionalProperties: true,
                required: ["destination", "duration", "budget", "days"],
                properties: {
                  destination: { type: "string" },
                  duration: { type: "string" },
                  budget: { type: "string" },
                  interests: {
                    type: "array",
                    items: { type: "string" },
                  },
                  overview: { type: "string" },
                  summary: { type: "string" },
                  tips: {
                    type: "array",
                    items: { type: "string" },
                  },
                  days: {
                    type: "array",
                    minItems: input.travelDays.length,
                    items: {
                      type: "object",
                      additionalProperties: true,
                      properties: {
                        title: { type: "string" },
                        date: { type: "string" },
                        summary: { type: "string" },
                        activities: {
                          type: "array",
                          items: {
                            type: "object",
                            additionalProperties: true,
                            properties: {
                              title: { type: "string" },
                              time: { type: "string" },
                              description: { type: "string" },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      messages: [
        {
          role: "system",
          content: [
            "You are an experienced travel planner.",
            "Create balanced itineraries that reflect the destination's highlights and the traveler's interests.",
            "Avoid repeating the same marquee attraction on multiple days unless the traveler explicitly requests it.",
            "Incorporate a mix of cultural, outdoor, dining, and neighborhood experiences.",
            "Each day should align with the provided travel days and cover morning, afternoon, and evening when appropriate.",
            "Respond strictly with JSON that matches the requested schema.",
          ].join(" "),
        },
        {
          role: "user",
          content: [
            "Trip request details:",
            JSON.stringify(
              {
                destination: input.destination,
                budget: input.budget,
                startDate: input.startDate,
                endDate: input.endDate,
                interests: input.interests,
                travelDays: input.travelDays,
              },
              null,
              2,
            ),
            "",
            "Generate a multi-day itinerary that uses every travel day.",
            "Provide specific recommendations with names of attractions, neighborhoods, and dining options for morning, afternoon, and evening each day.",
            "Include practical pacing guidance and variety so the traveler experiences more than a single attraction.",
            "Return the itinerary as JSON.",
          ].join("\n"),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter request failed with status ${response.status}`);
  }

  const completion = await response.json();

  const content = completion?.choices?.[0]?.message?.content;

  if (typeof content !== "string") {
    throw new Error("OpenRouter response did not include a text content payload");
  }

  const normalized = content
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```/i, "")
    .replace(/```$/i, "");

  let parsedContent: unknown;

  try {
    parsedContent = JSON.parse(normalized);
  } catch (error) {
    throw new Error(`Unable to parse OpenRouter JSON response: ${String(error)}`);
  }

  const validated = itineraryResponseSchema.safeParse(parsedContent);

  if (!validated.success) {
    throw new Error(`OpenRouter response validation failed: ${validated.error.message}`);
  }

  const itinerary =
    "itinerary" in validated.data
      ? (validated.data.itinerary as ItineraryContent)
      : (validated.data as ItineraryContent);

  return itinerary;
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const parsed = requestSchema.safeParse(json);

  if (!parsed.success) {
    const issues = parsed.error.flatten();
    return NextResponse.json(
      {
        error: "Invalid request body",
        fieldErrors: issues.fieldErrors,
      },
      { status: 400 },
    );
  }

  const sanitizedInterests = Array.from(
    new Set(
      (parsed.data.interests ?? [])
        .map((interest) => interest.trim())
        .filter((interest) => interest.length > 0),
    ),
  );

  const start = new Date(parsed.data.startDate);
  const end = new Date(parsed.data.endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return NextResponse.json(
      { error: "Start date and end date must be valid dates." },
      { status: 400 },
    );
  }

  if (start > end) {
    return NextResponse.json(
      { error: "End date must be after the start date." },
      { status: 400 },
    );
  }

  const fallbackItinerary = createFallbackItinerary(
    parsed.data.destination,
    parsed.data.budget,
    start,
    end,
    sanitizedInterests,
  );

  const travelDays = buildTravelDays(start, end);

  try {
    const aiItinerary = await generateItineraryWithOpenRouter({
      destination: parsed.data.destination,
      budget: parsed.data.budget,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate,
      interests: sanitizedInterests,
      travelDays,
    });

    if (aiItinerary) {
      const hydratedItinerary: ItineraryContent = {
        ...fallbackItinerary,
        ...aiItinerary,
      };

      if (!hydratedItinerary.destination) {
        hydratedItinerary.destination = fallbackItinerary.destination;
      }

      if (!hydratedItinerary.duration) {
        hydratedItinerary.duration = fallbackItinerary.duration;
      }

      if (!hydratedItinerary.budget) {
        hydratedItinerary.budget = fallbackItinerary.budget;
      }

      if (
        !hydratedItinerary.interests ||
        hydratedItinerary.interests.length === 0
      ) {
        hydratedItinerary.interests = fallbackItinerary.interests;
      }

      if (!hydratedItinerary.days || hydratedItinerary.days.length === 0) {
        hydratedItinerary.days = fallbackItinerary.days;
      }

      if (!hydratedItinerary.tips || hydratedItinerary.tips.length === 0) {
        hydratedItinerary.tips = fallbackItinerary.tips;
      }

      return NextResponse.json({ itinerary: hydratedItinerary });
    }
  } catch (error) {
    console.error("Failed to generate itinerary with OpenRouter:", error);
  }

  return NextResponse.json({ itinerary: fallbackItinerary });
}
