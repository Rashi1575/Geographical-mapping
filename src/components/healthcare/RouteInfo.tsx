import { Navigation } from "lucide-react";
import { routeInfo as defaultRoute } from "@/data/recommendations";

type RouteInfoData = typeof defaultRoute;

export function RouteInfo({ data = defaultRoute }: { data?: RouteInfoData }) {
  return (
    <div
      className="rounded-2xl border border-border p-4 relative overflow-hidden"
      style={{ background: "var(--gradient-card-tint)", boxShadow: "var(--shadow-card)" }}
    >
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[3px] opacity-70"
        style={{ background: "var(--gradient-accent-bar)" }}
      />
      <div className="flex items-center gap-2 mb-3">
        <Navigation className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Route Information</h3>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <Row label="Selected Hospital" value={data.selectedHospital} />
        <Row label="Distance" value={data.distance} />
        <Row label="Travel Time" value={data.travelTime} />
        <Row label="Estimated Arrival" value={data.arrival} />
        <div className="col-span-2 flex items-center justify-between border-t border-border pt-2 mt-1">
          <dt className="text-muted-foreground">Route Status</dt>
          <dd className="font-medium" style={{ color: "oklch(0.7 0.15 75)" }}>
            {data.status}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-foreground text-right font-medium">{value}</dd>
    </>
  );
}
