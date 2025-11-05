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

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
});

function createActivities(
  destination: string,
  interests: string[],
  dayIndex: number,
) {
  const segments = [
    { label: "Morning", time: "8:30 AM" },
    { label: "Afternoon", time: "1:30 PM" },
    { label: "Evening", time: "7:00 PM" },
  ];

  if (interests.length === 0) {
    return segments.map((segment) => ({
      title: `${segment.label} adventure`,
      time: segment.time,
      description: `Spend your ${segment.label.toLowerCase()} discovering a new corner of ${destination}. Mix in cafes, museums, or parks based on the vibe you’re feeling.`,
    }));
  }

  return segments.map((segment, segmentIndex) => {
    const interest = interests[(dayIndex + segmentIndex) % interests.length];
    return {
      title: `${segment.label} – ${interest}`,
      time: segment.time,
      description: `Immerse yourself in ${interest.toLowerCase()} experiences around ${destination}. Reserve a little time to wander and see what surprises you find.`,
    };
  });
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
      interests.length > 0
        ? interests[index % interests.length]
        : "local highlights";

    plans.push({
      title: `Day ${index + 1}`,
      date: formattedDate,
      summary: `Spend the day exploring ${focus.toLowerCase()} in ${destination}. Balance anchor activities with time to relax and soak in the atmosphere.`,
      activities: createActivities(destination, interests, index),
    });
  }

  return plans;
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

  const dayPlans = buildDayPlans(
    parsed.data.destination,
    start,
    end,
    sanitizedInterests,
  );

  const durationInDays = dayPlans.length;

  const interestSummary =
    sanitizedInterests.length > 0
      ? sanitizedInterests.slice(0, 3).join(", ")
      : "a mix of culture, dining, and relaxation";

  const itinerary = {
    destination: parsed.data.destination,
    duration: `${durationInDays} day${durationInDays === 1 ? "" : "s"}`,
    budget: parsed.data.budget,
    interests: sanitizedInterests,
    overview: `A ${durationInDays}-day escape to ${parsed.data.destination} tailored to a ${parsed.data.budget} budget. Expect a balance of must-see highlights with time to follow your curiosity around ${interestSummary}.`,
    tips: [
      "Block off a little buffer time each day for spontaneous discoveries.",
      "Check opening hours a day ahead—local schedules can shift seasonally.",
      "Bookmark directions offline in case your connection drops while exploring.",
    ],
    days: dayPlans,
  };

  return NextResponse.json({ itinerary });
}
