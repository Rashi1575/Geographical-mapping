import { Search, HeartPulse, Bell, Sun, Moon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTheme } from "./ThemeProvider";
import { useState } from "react";
import { recommendations } from "@/data/recommendations";
import { useNavigate } from "@tanstack/react-router";

export function Header() {
  const { theme, toggle } = useTheme();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const results = recommendations.filter((r) => {
    const q = query.toLowerCase();

    return (
      r.name.toLowerCase().includes(q) ||
      r.specialty.toLowerCase().includes(q) ||
      r.address.toLowerCase().includes(q)
    );
  });
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/70 backdrop-blur-xl supports-[backdrop-filter]:bg-card/60">
      <div className="flex items-center gap-4 px-6 py-3">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-sm"
            style={{ background: "var(--gradient-primary)" }}
          >
            <HeartPulse className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-foreground leading-tight">
              Smart Healthcare Mapping System
            </h1>
            <p className="text-xs text-muted-foreground">
              Find the best nearby medical facility instantly
            </p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="block w-full max-w-sm relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search hospitals, clinics, specialties..."
              className="pl-9 h-9 bg-background/80 border-border"
            />

            {query.length > 0 && (
              <div className="absolute top-11 left-0 right-0 rounded-lg border border-border bg-card shadow-lg z-50 max-h-64 overflow-y-auto">
                <div className="px-3 py-2 text-xs text-muted-foreground border-b border-border">
                  Search Results
                </div>

                {results.map((item) => (
                  <div
                    key={item.id}
                    className="px-3 py-2 hover:bg-muted cursor-pointer text-sm transition-colors"
                    onClick={() => {
                      setQuery("");
                      navigate({ to: "/live-map" });
                    }}
                  >
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.specialty} • {item.address}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={toggle}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
            className="relative h-9 w-9 inline-flex items-center justify-center rounded-full border border-border bg-card/70 text-muted-foreground hover:text-foreground hover:bg-card transition-colors overflow-hidden"
          >
            <Sun
              className={`h-4 w-4 absolute transition-all duration-300 ${
                theme === "dark"
                  ? "opacity-0 -rotate-90 scale-50"
                  : "opacity-100 rotate-0 scale-100"
              }`}
            />
            <Moon
              className={`h-4 w-4 absolute transition-all duration-300 ${
                theme === "dark" ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-50"
              }`}
            />
          </button>
          <button className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-border bg-card/70 text-muted-foreground hover:text-foreground hover:bg-card transition-colors">
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
