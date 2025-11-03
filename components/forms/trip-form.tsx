"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TripInputSchema, type TripInput } from "@/lib/zod-schemas";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

const defaultValues: TripInput = {
  title: "",
  destination: "",
  startDate: "",
  endDate: "",
  travelers: 1,
  preferences: [],
  budget: {
    currency: "USD",
    total: 0,
    breakdown: []
  },
  itinerary: [],
  lodging: [],
  weather: [],
  notes: "",
  status: "draft"
};

export function TripForm({ seed }: { seed?: Partial<TripInput> }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TripInput>({
    resolver: zodResolver(TripInputSchema),
    defaultValues: { ...defaultValues, ...seed }
  });

  const onSubmit = async (values: TripInput) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });

      if (!res.ok) throw new Error("Failed to create trip");
      const trip = await res.json();
      toast({ title: "Trip created", description: "Your itinerary is ready." });
      router.push(`/(app)/trip/${trip.id}`);
    } catch (error) {
      console.error(error);
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Trip title</label>
          <Input placeholder="Kyoto Food Escape" {...form.register("title")} />
          {form.formState.errors.title && (
            <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Destination</label>
          <Input placeholder="Kyoto, Japan" {...form.register("destination")} />
          {form.formState.errors.destination && (
            <p className="text-sm text-destructive">{form.formState.errors.destination.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Start date</label>
          <Input type="date" {...form.register("startDate")} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">End date</label>
          <Input type="date" {...form.register("endDate")} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Travelers</label>
          <Input type="number" min={1} {...form.register("travelers", { valueAsNumber: true })} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Preferences (comma separated)</label>
          <Input
            placeholder="food, culture"
            {...form.register("preferences", {
              setValueAs: (value) =>
                typeof value === "string"
                  ? value
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean)
                  : []
            })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Additional notes</label>
        <Textarea placeholder="Let the AI know about dietary preferences or must-do experiences." {...form.register("notes")} />
      </div>

      <div className="rounded-3xl border border-dashed border-primary/40 bg-primary/5 p-6 text-sm text-muted-foreground">
        Planora will automatically generate itinerary days, budget, weather, and lodging suggestions once you submit.
      </div>

      <Button type="submit" size="lg" className="w-full md:w-auto" disabled={isSubmitting}>
        {isSubmitting ? "Generating itinerary…" : "Generate itinerary"}
      </Button>
    </form>
  );
}
