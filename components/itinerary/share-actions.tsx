"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export function ShareActions({ tripId }: { tripId: string }) {
  const { toast } = useToast();

  const handleShare = (type: "pdf" | "ics" | "link") => {
    toast({ title: "Export queued", description: `Generating ${type.toUpperCase()} for ${tripId}` });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="outline" onClick={() => handleShare("pdf")}>
        Export PDF
      </Button>
      <Button variant="outline" onClick={() => handleShare("ics")}>
        Export .ics
      </Button>
      <Button onClick={() => handleShare("link")}>Share link</Button>
    </div>
  );
}
