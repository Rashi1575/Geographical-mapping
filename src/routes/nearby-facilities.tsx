import { createFileRoute } from "@tanstack/react-router";
import { Navigation, Truck, Building2, Stethoscope, Pill } from "lucide-react";
import { PageHeader } from "@/components/healthcare/PageHeader";

export const Route = createFileRoute("/nearby-facilities")({
  head: () => ({
    meta: [
      { title: "Nearby Facilities — Smart Healthcare Mapping System" },
      {
        name: "description",
        content: "Browse all medical facilities and mobile units near your current location.",
      },
    ],
  }),
  component: NearbyFacilitiesPage,
});

const facilities = [
  {
    icon: Building2,
    type: "Hospital",
    name: "City Care Hospital",
    distance: "1.8 km",
    status: "Open · ER",
    color: "var(--primary)",
  },
  {
    icon: Stethoscope,
    type: "Clinic",
    name: "Linden Family Clinic",
    distance: "0.9 km",
    status: "Open",
    color: "var(--accent-teal)",
  },
  {
    icon: Truck,
    type: "Mobile Unit",
    name: "MedMobile Unit 4",
    distance: "2.3 km",
    status: "On route",
    color: "var(--primary-glow)",
  },
  {
    icon: Pill,
    type: "Pharmacy",
    name: "Sunrise Pharmacy",
    distance: "0.4 km",
    status: "24/7",
    color: "var(--accent-teal)",
  },
  {
    icon: Building2,
    type: "Hospital",
    name: "Metro Health Centre",
    distance: "2.6 km",
    status: "Open · ER",
    color: "var(--primary)",
  },
  {
    icon: Truck,
    type: "Mobile Unit",
    name: "Riverside Ambulance 2",
    distance: "3.1 km",
    status: "Available",
    color: "var(--primary-glow)",
  },
];

function NearbyFacilitiesPage() {
  return (
    <div>
      <PageHeader
        icon={Navigation}
        title="Nearby Facilities"
        description="All medical resources around you — hospitals, clinics, pharmacies, and mobile units — sorted by proximity."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {facilities.map((f) => {
          const Icon = f.icon;
          return (
            <article
              key={f.name}
              className="rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="h-11 w-11 rounded-xl flex items-center justify-center text-white shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, ${f.color}, color-mix(in oklab, ${f.color} 60%, white))`,
                  }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                    {f.type}
                  </div>
                  <h3 className="text-sm font-semibold text-foreground truncate">{f.name}</h3>
                  <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                    <span>{f.distance}</span>
                    <span className="px-2 py-0.5 rounded-full bg-accent-teal/10 text-accent-teal border border-accent-teal/20 text-[10px] font-medium">
                      {f.status}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
