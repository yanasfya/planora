import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TripForm } from "@/components/forms/trip-form";

export default function TripCreatePage() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Plan a new adventure</CardTitle>
          <CardDescription>
            Share your goals, constraints, and inspiration. Planora orchestrates the AI, APIs, and data for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TripForm />
        </CardContent>
      </Card>
    </div>
  );
}
