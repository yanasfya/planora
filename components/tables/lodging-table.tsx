import type { TripDocument } from "@/lib/zod-schemas";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export function LodgingTable({ trip }: { trip: TripDocument }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border/60">
      <table className="w-full text-left text-sm">
        <thead className="bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-6 py-3">Property</th>
            <th className="px-6 py-3">Address</th>
            <th className="px-6 py-3">Nightly rate</th>
            <th className="px-6 py-3">Rating</th>
            <th className="px-6 py-3 text-right">Link</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {trip.lodging.map((stay) => (
            <tr key={stay.id} className="bg-card/80">
              <td className="px-6 py-4 font-semibold">{stay.name}</td>
              <td className="px-6 py-4 text-muted-foreground">{stay.address}</td>
              <td className="px-6 py-4">{formatCurrency(stay.pricePerNight, trip.budget.currency)}</td>
              <td className="px-6 py-4">{stay.rating.toFixed(1)}</td>
              <td className="px-6 py-4 text-right">
                <Link href={stay.url} className="text-primary underline" target="_blank">
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
