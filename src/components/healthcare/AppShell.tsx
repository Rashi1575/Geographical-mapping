import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { ShellProvider } from "./ShellContext";
import { useRouterState } from "@tanstack/react-router";
import { useState, useEffect, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";

export function AppShell({ children }: { children: ReactNode }) {
  const [dismissed, setDismissed] = useState(false);
  // 1. New state to hold the logged-in user's profile
  const [user, setUser] = useState<{ full_name: string; email: string } | null>(null);
  
  const navigate = useNavigate();

  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });

  // 2. Fetch the user profile from Python backend when the app loads (or path changes)
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('smarthealth_token');
      if (!token) {
        setUser(null);
        return;
      }

      try {
        const response = await fetch('http://localhost:8001/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData); // Save the name and email!
        } else {
          // Token is expired or invalid
          localStorage.removeItem('smarthealth_token');
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
      }
    };

    fetchProfile();
  }, [pathname]); // Re-run when the route changes so it updates instantly after login

  // 3. Logic to determine which banner to show
  const isHomePage = pathname === "/";
  const showGuestBanner = isHomePage && !dismissed && !user;
  const showWelcomeBanner = isHomePage && !dismissed && user;

  const handleLogout = () => {
    localStorage.removeItem('smarthealth_token');
    setUser(null);
    navigate({ to: '/login' });
  };

  return (
    <ShellProvider>
      <div className="min-h-screen flex text-foreground">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 ml-16 md:ml-60">
          <Header />
          
          {/* --- GUEST BANNER --- */}
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

          {/* --- WELCOME BACK LOGGED-IN BANNER --- */}
          {showWelcomeBanner && (
            <div
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-xl px-3 py-2 shadow-sm border border-emerald-500/20"
              style={{ background: "linear-gradient(to right, #047857, #10b981)" }} // Green gradient for success/login
            >
              <div>
                <p className="text-sm font-semibold text-white">Welcome back, {user.full_name}!</p>
                <p className="text-xs text-white/80 leading-relaxed">
                  You are securely logged in as {user.email}. Your preferences and emergency data are active.
                </p>
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  onClick={handleLogout}
                  className="px-2.5 py-1 text-xs rounded-lg border border-white/30 text-white hover:bg-white/10 transition"
                >
                  Log Out
                </button>
                <button
                  onClick={() => setDismissed(true)}
                  className="px-2.5 py-1 text-xs rounded-lg text-white/80 text-sm hover:text-white transition"
                >
                  Dismiss
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
