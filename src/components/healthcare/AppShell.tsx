import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { ShellProvider } from "./ShellContext";
import { useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";

export function AppShell({ children }: { children: ReactNode }) {
  const [dismissed, setDismissed] = useState(false);

  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });

  const showGuestBanner = pathname === "/" && !dismissed;
  return (
    <ShellProvider>
      <div className="min-h-screen flex text-foreground">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 ml-16 md:ml-60">
          <Header />
          {showGuestBanner && (
            <div
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-xl px-3 py-2 shadow-sm border border-cyan-500/20"
              style={{ background: "var(--gradient-banner)" }}
            >
              <div>
                <p className="text-sm font-semibold text-white">Continue as Guest (Recommended)</p>
                <p className="text-xs text-white/80 leading-relaxed">
                  You can use SmartHealth without an account. Sign up later to save your history,
                  preferences, emergency contacts, and enjoy a faster future experience.
                </p>
              </div>

              <div className="flex gap-2 shrink-0">
                {/* <button className="px-2.5 py-1 text-xs rounded-lg bg-white text-slate-900 text-sm font-medium hover:bg-slate-100 transition">
                  Sign Up
                </button>

                <button className="px-2.5 py-1 text-xs rounded-lg border border-white/30 text-white text-sm hover:bg-white/10 transition">
                  Log In
                </button> */}
                <Link
                  to="/signup"
                  className="px-2.5 py-1 text-xs rounded-lg bg-white text-slate-900 font-medium hover:bg-slate-100 transition"
                >
                  Sign Up
                </Link>

                <Link
                  to="/login"
                  className="px-2.5 py-1 text-xs rounded-lg border border-white/30 text-white hover:bg-white/10 transition"
                >
                  Log In
                </Link>

                <button
                  onClick={() => setDismissed(true)}
                  className="px-2.5 py-1 text-xs rounded-lg text-white/80 text-sm hover:text-white transition"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          )}

          <main className="flex-1 px-6 py-6">{children}</main>

          <footer className="border-t border-border bg-card/60 backdrop-blur px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <p>© {new Date().getFullYear()} Smart Healthcare Mapping System</p>
              <nav className="flex flex-wrap gap-4">
                <a href="#" className="hover:text-foreground transition-colors">
                  About
                </a>
                <a href="#" className="hover:text-foreground transition-colors">
                  Contact
                </a>
                <a href="#" className="hover:text-foreground transition-colors">
                  Privacy
                </a>
                <a href="#" className="hover:text-foreground transition-colors">
                  Emergency Disclaimer
                </a>
              </nav>
            </div>
          </footer>
        </div>
      </div>
    </ShellProvider>
  );
}
