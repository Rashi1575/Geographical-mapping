import { Star, MapPin, Clock, Stethoscope, Sparkles, Hospital } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Recommendation } from "@/data/recommendations";

export function RecommendationCard({
  rec,
  onViewMap,
}: {
  rec: Recommendation;
  onViewMap: (rec: Recommendation) => void;
}) {
  return (
    <article
      className="group relative rounded-2xl border border-border p-4 pt-[18px] overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30"
      style={{ background: "var(--gradient-card-tint)", boxShadow: "var(--shadow-card)" }}
    >
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[3px] opacity-70 group-hover:opacity-100 transition-opacity"
        style={{ background: "var(--gradient-accent-bar)" }}
      />
      <div className="flex items-start gap-3">
        <div
          className="h-12 w-12 shrink-0 rounded-xl flex items-center justify-center text-primary ring-1 ring-primary/10"
          style={{ background: "var(--gradient-soft)" }}
        >
          <Hospital className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-foreground truncate">{rec.name}</h3>
            {rec.emergency && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                ER 24/7
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{rec.address}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-foreground">
          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
          <span>{rec.rating.toFixed(1)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span>{rec.distanceKm} km</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>{rec.travelTimeMin} min</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground truncate">
          <Stethoscope className="h-3.5 w-3.5" />
          <span className="truncate">{rec.specialty}</span>
        </div>
      </div>

      <div className="mt-3 flex justify-end">
        <Button
          size="sm"
          className="h-8 text-xs text-white border-0 shadow-sm hover:brightness-105"
          style={{ background: "var(--gradient-primary)" }}
          onClick={() => onViewMap(rec)}
        >
          View on Map
        </Button>
      </div>
    </article>
  );
}
