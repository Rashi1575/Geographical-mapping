import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Phone, HeartPulse, Flame, Shield, Ambulance } from "lucide-react";
import { PageHeader } from "@/components/healthcare/PageHeader";

export const Route = createFileRoute("/emergency-info")({
  head: () => ({
    meta: [
      { title: "Emergency Information — Smart Healthcare Mapping System" },
      {
        name: "description",
        content:
          "Emergency contact numbers, first-aid guidance, and what to do in a medical crisis.",
      },
    ],
  }),
  component: EmergencyInfoPage,
});

const contacts = [
  { icon: Ambulance, label: "Ambulance", number: "108" },
  { icon: HeartPulse, label: "Medical Helpline", number: "104" },
  { icon: Shield, label: "Police", number: "100" },
  { icon: Flame, label: "Fire Department", number: "101" },
];

const steps = [
  {
    title: "Stay calm",
    body: "Take a deep breath. Panic reduces your ability to think clearly and act quickly.",
  },
  {
    title: "Call for help",
    body: "Dial the relevant emergency number immediately and describe your situation clearly.",
  },
  {
    title: "Share location",
    body: "Use the live map to share your exact GPS coordinates with responders.",
  },
  {
    title: "Provide first aid",
    body: "Apply basic first aid if trained — stop bleeding, perform CPR, or keep the patient stable.",
  },
];

function EmergencyInfoPage() {
  return (
    <div>
      <PageHeader
        icon={AlertTriangle}
        title="Emergency Information"
        description="Important contacts and step-by-step guidance for medical emergencies. Save this page for offline access."
      />

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {contacts.map((c) => {
          const Icon = c.icon;
          return (
            <a
              key={c.label}
              href={`tel:${c.number}`}
              className="rounded-2xl border border-border bg-card p-4 text-center transition-all hover:-translate-y-0.5 hover:border-primary/30"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div
                className="mx-auto h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-sm mb-2"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div className="text-xs text-muted-foreground">{c.label}</div>
              <div className="text-lg font-bold text-foreground flex items-center justify-center gap-1 mt-0.5">
                <Phone className="h-3.5 w-3.5 text-primary" />
                {c.number}
              </div>
            </a>
          );
        })}
      </section>

      <section
        className="rounded-2xl border border-border bg-card p-6"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <h2 className="text-sm font-semibold text-foreground mb-4">What to do in an emergency</h2>
        <ol className="space-y-4">
          {steps.map((s, i) => (
            <li key={s.title} className="flex gap-4">
              <div
                className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm"
                style={{ background: "var(--gradient-primary)" }}
              >
                {i + 1}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{s.title}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-4 text-xs text-muted-foreground text-center">
        This information is for general guidance only and does not replace professional medical
        advice.
      </p>
    </div>
  );
}
