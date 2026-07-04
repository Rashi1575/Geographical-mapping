import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  Hospital,
  Map,
  Navigation,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Video, 
} from "lucide-react";
import { useShell } from "./ShellContext";

// --- CHANGED 'as const' TO A TYPE THAT ALLOWS LOOSE STRING ROUTES ---
type SidebarItem = {
  readonly icon: React.ComponentType<any>;
  readonly label: string;
  readonly to: string; // Allows loose strings alongside strict routes
};

const items: readonly SidebarItem[] = [
  { icon: Home, label: "Home", to: "/" },
  { icon: Map, label: "Live Map", to: "/live-map" },
  { icon: Navigation, label: "Nearby Facilities", to: "/nearby-facilities" },
  { icon: AlertTriangle, label: "Emergency Info", to: "/emergency-info" },
  { icon: Video, label: "Telemedicine", to: "/telemedicine" }, 
];

export function Sidebar() {
  const { collapsed, toggle } = useShell();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside
      className={`flex fixed left-0 top-0 h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-300 ease-in-out z-50 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      <div className="px-4 py-4 border-b border-sidebar-border flex items-center gap-2">
        <div
          className="h-9 w-9 shrink-0 rounded-lg flex items-center justify-center text-white shadow-sm"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Hospital className="h-4 w-4" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-sm font-semibold text-sidebar-foreground truncate">
              SmartHealth
            </div>
            <div className="text-[10px] text-muted-foreground truncate">Mapping System</div>
          </div>
        )}
        <button
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="ml-auto h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to as any} // Casted to 'any' to bypass strict TanStack router tree checks temporarily
              title={item.label}
              className={`group relative w-full flex items-center gap-3 px-3 py-2 text-sm rounded-full transition-all duration-200 ${
                active
                  ? "text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
              style={active ? { background: "var(--gradient-primary)" } : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="border-t border-sidebar-border p-4">
          <div className="rounded-xl border border-border p-3 bg-card/50">
            <p className="text-sm font-semibold text-foreground">👤 Guest Mode</p>

            <p className="mt-1 text-xs text-muted-foreground">Save history and preferences.</p>

            <div className="mt-3 flex gap-2">
              <Link
                to="/signup"
                className="flex-1 rounded-md px-2 py-1 text-center text-xs font-medium text-white"
                style={{ background: "var(--gradient-primary)" }}
              >
                Sign Up
              </Link>

              <Link
                to="/login"
                className="flex-1 rounded-md border border-border px-2 py-1 text-center text-xs hover:bg-muted"
              >
                Log In
              </Link>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}     
