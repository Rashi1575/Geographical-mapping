import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Hospital,
  Map as MapIcon,
  Activity,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { SearchPanel } from "@/components/healthcare/SearchPanel";
import { RecommendationCard } from "@/components/healthcare/RecommendationCard";
import { MapSection } from "@/components/healthcare/MapSection";
import { recommendations } from "@/data/recommendations";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Home — Smart Healthcare Mapping System" },
      {
        name: "description",
        content:
          "Find the best nearby hospital, clinic, or mobile medical unit in an emergency — instantly.",
      },
    ],
  }),
  component: Home,
});

const stats = [
  { icon: Hospital, label: "Facilities", value: "1,248" },
  { icon: Activity, label: "Live now", value: "312" },
  { icon: Clock, label: "Avg. response", value: "7 min" },
  { icon: ShieldCheck, label: "ER ready", value: "184" },
];

function Home() {
  const [selectedHospital, setSelectedHospital] = useState(recommendations[0]);
  return (
    <div className="space-y-6">
      {/* Quick links */}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_45%] gap-6">
        <div className="space-y-5 min-w-0">
          <SearchPanel />

          <section>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-sm font-semibold text-foreground">
                Recommended Medical Facilities
              </h2>
              <span className="text-xs text-muted-foreground">
                {recommendations.length} matches
              </span>
            </div>
            <div className="space-y-3">
              {recommendations.map((rec) => (
                <RecommendationCard key={rec.id} rec={rec} onViewMap={setSelectedHospital} />
              ))}
            </div>
          </section>
        </div>

        <div className="min-w-0">
          <div className="space-y-4 sticky top-20">
            <MapSection selectedHospital={selectedHospital} />
          </div>
        </div>
      </div>
    </div>
  );
}
