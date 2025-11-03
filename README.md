# Planora · AI Travel Planner

Planora is a Next.js 15-ready full-stack starter that mirrors the Capstone 2 specification for an AI-powered travel planning platform. It includes a fully typed API pipeline, LLM orchestration mocks, MongoDB models, NextAuth authentication, and pixel-friendly UI primitives built with Tailwind CSS and shadcn/ui.

## Features

- **Modular App Router structure** with marketing, dashboard, trip creation, and itinerary detail flows.
- **LLM pipeline stubs** that map prompts, validate JSON with Zod, and run enrichment steps.
- **MongoDB schemas & seed script** using Mongoose for trips and demo users.
- **NextAuth authentication** supporting credentials (with optional Google OAuth).
- **UI system** with Tailwind, shadcn/ui, Zustand, and Recharts budget visualization.
- **Itinerary experience** featuring drag-and-drop editing, weather sidebar, lodging table, map preview, and share/export actions.

## Getting started

```bash
pnpm install
pnpm dev
```

Set the required environment variables using `.env.example` as a template.

To seed demo data locally:

```bash
pnpm seed
```

## Project layout

```
/app
  /(marketing)        Landing page
  /(app)              Authenticated experience
  /api                REST + tool routes
/components          UI primitives, forms, itinerary widgets
/lib                 Database, auth, LLM, enrichment utilities
/styles              Global Tailwind styles
/store               Zustand state slices
```

## Deployment

The project targets Vercel + MongoDB Atlas. Ensure the environment variables for NextAuth, Atlas, and external APIs (Gemini, Google Maps, TripAdvisor, Booking.com, OpenWeather) are configured in Vercel.
