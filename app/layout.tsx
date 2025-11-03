import "@/styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { AppProviders } from "@/components/app-providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Planora | AI Travel Planner",
  description: "AI-powered itinerary planning built with Next.js"
};

export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans", inter.variable)}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
