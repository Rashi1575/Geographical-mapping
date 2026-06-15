import { MapPin, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SearchPanel() {
  return (
    <section
      className="rounded-2xl border border-border p-6 transition-shadow hover:shadow-md"
      style={{ background: "var(--gradient-card-tint)", boxShadow: "var(--shadow-card)" }}
    >
      <div className="mb-5 flex items-start gap-3 pb-4 border-b border-border/70">
        <div
          className="h-10 w-10 shrink-0 rounded-xl flex items-center justify-center text-white shadow-sm"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Stethoscope className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground tracking-tight">
            Describe Your Situation
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Share your symptoms so we can recommend the right facility.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="symptoms" className="text-xs">
            Primary symptoms
          </Label>
          <Input id="symptoms" placeholder="e.g. chest pain, shortness of breath" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="details" className="text-xs">
            Additional details
          </Label>
          <Textarea
            id="details"
            rows={3}
            placeholder="When did it start? Any prior conditions, medication, allergies?"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="location" className="text-xs">
            Your location (optional)
          </Label>
          <div className="flex gap-2">
            <Input id="location" placeholder="Enter address or area" />
            <Button variant="outline" type="button" className="shrink-0">
              <MapPin className="h-4 w-4 mr-1.5" />
              Current
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Specialty</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Any specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Medicine</SelectItem>
                <SelectItem value="cardio">Cardiology</SelectItem>
                <SelectItem value="ortho">Orthopedics</SelectItem>
                <SelectItem value="pedia">Pediatrics</SelectItem>
                <SelectItem value="neuro">Neurology</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Distance</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Within 5 km" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">Within 2 km</SelectItem>
                <SelectItem value="5">Within 5 km</SelectItem>
                <SelectItem value="10">Within 10 km</SelectItem>
                <SelectItem value="25">Within 25 km</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs">Insurance / payment</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="insurance">Private insurance</SelectItem>
                <SelectItem value="public">Public / government</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
          <div>
            <Label htmlFor="emergency" className="text-sm">
              Emergency situation
            </Label>
            <p className="text-xs text-muted-foreground">
              Prioritize hospitals with ER & ambulance.
            </p>
          </div>
          <Switch id="emergency" />
        </div>

        <Button
          className="w-full text-white border-0 shadow-sm hover:shadow-md hover:brightness-105 transition-all"
          style={{ background: "var(--gradient-primary)" }}
        >
          Find Best Hospital
        </Button>
      </div>
    </section>
  );
}
