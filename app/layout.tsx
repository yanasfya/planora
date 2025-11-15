import "./globals.css";
import { CurrencyProvider } from "./contexts/CurrencyContext";

export const metadata = { title: "Planora", description: "AI-Powered Travel Planner" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <CurrencyProvider>{children}</CurrencyProvider>
      </body>
    </html>
  );
}
