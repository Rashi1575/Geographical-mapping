import type { LucideIcon } from "lucide-react";

export function PageHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div
      className="rounded-2xl border border-border p-6 mb-6 relative overflow-hidden"
      style={{ background: "var(--gradient-soft)", boxShadow: "var(--shadow-card)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full opacity-40 blur-3xl"
        style={{ background: "var(--gradient-primary)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full opacity-25 blur-3xl"
        style={{ background: "linear-gradient(135deg, var(--accent-teal), transparent)" }}
      />
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ background: "var(--gradient-accent-bar)" }}
      />
      <div className="relative flex items-start gap-4">
        <div
          className="h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-md ring-1 ring-white/40"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
