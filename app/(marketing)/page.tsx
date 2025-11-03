"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const features = [
  {
    title: "AI-Crafted Itineraries",
    description:
      "Personalized day-by-day plans enriched with insider recommendations and live availability.",
    metric: "3k+ trips planned"
  },
  {
    title: "Real-time Context",
    description: "Weather, transit, and lodging updates synchronized across the experience.",
    metric: "120+ cities covered"
  },
  {
    title: "Collaborative Workflows",
    description: "Share, export, and co-edit itineraries with friends or clients in one dashboard.",
    metric: "98% satisfaction"
  }
];

export default function MarketingPage() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-background via-background to-background">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 pb-24 pt-24 lg:px-12">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-lg font-semibold">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-2xl text-primary">✈️</span>
            <div>
              <p className="font-display text-2xl">Planora</p>
              <p className="text-sm text-muted-foreground">AI Travel Planner</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/(app)/dashboard">Open app</Link>
            </Button>
          </div>
        </header>

        <main className="mt-20 grid gap-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
          <div className="space-y-10">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="font-display text-4xl leading-tight text-foreground sm:text-5xl lg:text-6xl"
            >
              Design unforgettable journeys with an AI planner that thinks like a travel expert.
            </motion.h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Planora automates the entire itinerary lifecycle—from the first spark of inspiration to sharing a polished plan. Our
              AI blends local insights, weather intelligence, and budget controls into a single collaborative workspace.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="lg" asChild>
                <Link href="/(app)/trip/create">Start planning</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Explore features</Link>
              </Button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative rounded-[32px] border border-border/60 bg-card/90 p-8 shadow-xl backdrop-blur"
          >
            <div className="flex flex-col gap-6">
              <div className="rounded-3xl border border-border/50 bg-gradient-to-br from-primary/15 via-background to-accent/10 p-6">
                <p className="text-sm text-muted-foreground">Live preview</p>
                <p className="mt-3 text-lg font-medium text-foreground">3-Day Kyoto Food Escape</p>
                <div className="mt-6 grid gap-4 text-sm">
                  {[
                    { day: "Day 1", summary: "Arashiyama exploration, tea ceremony, river cruise" },
                    { day: "Day 2", summary: "Market tasting tour, sake pairing dinner" },
                    { day: "Day 3", summary: "Temple sunrise, kaiseki farewell" }
                  ].map((item) => (
                    <div key={item.day} className="flex items-start gap-3 rounded-2xl bg-background/80 p-4">
                      <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-sm font-medium text-primary">
                        {item.day.split(" ")[1]}
                      </span>
                      <div>
                        <p className="font-medium">{item.day}</p>
                        <p className="text-muted-foreground">{item.summary}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-3 rounded-3xl border border-border/50 bg-background/60 p-6 text-sm">
                <p className="text-muted-foreground">Why travel teams love Planora</p>
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-accent/20 text-lg">⚡️</span>
                  <div>
                    <p className="font-semibold">LLM automation pipeline</p>
                    <p className="text-muted-foreground">Structured JSON responses with validation, enrichment, and storage.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/20 text-lg">🌤️</span>
                  <div>
                    <p className="font-semibold">Weather-aware planning</p>
                    <p className="text-muted-foreground">OpenWeather and Google Maps data guide every recommendation.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </main>

        <section id="features" className="mt-32 grid gap-8 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-3xl border border-border/60 bg-card/80 p-6">
              <p className="text-sm uppercase tracking-wider text-muted-foreground">{feature.metric}</p>
              <p className="mt-4 font-display text-2xl text-foreground">{feature.title}</p>
              <p className="mt-3 text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
