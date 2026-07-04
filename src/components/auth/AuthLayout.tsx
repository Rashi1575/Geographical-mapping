import type { ReactNode } from "react";
import { HeartPulse } from "lucide-react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div
            className="h-14 w-14 rounded-xl flex items-center justify-center text-white"
            style={{ background: "var(--gradient-primary)" }}
          >
            <HeartPulse className="h-7 w-7" />
          </div>

          <h1 className="mt-4 text-2xl font-bold">SmartHealth</h1>

          <p className="text-sm text-muted-foreground text-center mt-1">
            Emergency healthcare assistance when you need it most.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">{children}</div>
      </div>
    </div>
  );
}
