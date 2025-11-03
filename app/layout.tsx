import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Planora",
  description: "AI Travel Planner MVP",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0b0b0b" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
