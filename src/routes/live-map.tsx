import { createFileRoute } from "@tanstack/react-router";
import { Map as MapIcon } from "lucide-react";
import { PageHeader } from "@/components/healthcare/PageHeader";
import { MapSection } from "@/components/healthcare/MapSection";
import { RouteInfo } from "@/components/healthcare/RouteInfo";
import { recommendations } from "@/data/recommendations";

export const Route = createFileRoute("/live-map")({
  head: () => ({
    meta: [
      { title: "Live Map — Smart Healthcare Mapping System" },
      {
        name: "description",
        content: "Real-time interactive map of hospitals, clinics, and mobile units.",
      },
    ],
  }),
  component: LiveMapPage,
});

function LiveMapPage() {
  return (
    <div>
      <PageHeader
        icon={MapIcon}
        title="Live Map"
        description="Real-time view of nearby medical facilities and mobile units. Click any pin to view route information."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6">
        <MapSection height="h-[640px]" />

        <aside className="space-y-4">
          <RouteInfo />
        </aside>
      </div>
    </div>
  );
}
