import { MapPin, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface SearchPanelProps {
  locationAddress?: string;
  onLocationAddressChange?: (address: string) => void;
  onGetCurrentLocation?: () => void;
  onLocationSubmit?: () => void;
}

export function SearchPanel({
  locationAddress = "",
  onLocationAddressChange = () => {},
  onGetCurrentLocation = () => {},
  onLocationSubmit = () => {},
}: SearchPanelProps) {
  // State variables for inputs
  const [symptom1, setSymptom1] = useState("");
  const [symptom2, setSymptom2] = useState("");
  const [symptom3, setSymptom3] = useState("");

  // State variables for API interaction
  const [result, setResult] = useState<{ disease: string; severity: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Function to process disease detection when button is clicked
  const handleDetectDisease = async () => {
    // Prevent empty requests
    if (!symptom1 && !symptom2 && !symptom3) {
      setError("Please enter at least one symptom.");
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      // Change your fetch URL to this:
const response = await fetch("https://corsproxy.io/?https://ohsl-healthcare-api-production.up.railway.app/predict", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    symptom1: symptom1.trim(),
    symptom2: symptom2.trim(),
    symptom3: symptom3.trim(),
  }),
});

      if (!response.ok) {
        throw new Error("Failed to get prediction from server.");
      }

      const data = await response.json();
      
      // Save result to display in the UI
      setResult({
        disease: data.disease || data.predicted_disease || "Unknown",
        severity: data.severity || "Unknown",
      });

    } catch (err: any) {
      console.error(err);
      setError("Failed to connect to the prediction API. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      className="rounded-2xl border border-border p-6 transition-shadow hover:shadow-md"
      style={{ background: "var(--gradient-card-tint)", boxShadow: "var(--shadow-card)" }}
    >
      {/* Header Panel Section */}
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
        {/* Primary Symptoms - 3 Distinct Fields */}
        <div className="space-y-2">
          <Label className="text-xs">Primary symptoms</Label>
          <div className="space-y-2">
            <Input 
              id="symptom1" 
              placeholder="Symptom 1 (e.g. chest pain)" 
              value={symptom1}
              onChange={(e) => setSymptom1(e.target.value)}
            />
            <Input 
              id="symptom2" 
              placeholder="Symptom 2 (e.g. shortness of breath)" 
              value={symptom2}
              onChange={(e) => setSymptom2(e.target.value)}
            />
            <Input 
              id="symptom3" 
              placeholder="Symptom 3 (e.g. high fever)" 
              value={symptom3}
              onChange={(e) => setSymptom3(e.target.value)}
            />
          </div>
        </div>

        {/* Detect Disease Action Button */}
        <Button
          type="button"
          onClick={handleDetectDisease}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs py-2 shadow-sm transition-all disabled:opacity-70"
        >
          {isLoading ? "🔍 Analyzing..." : "🔍 Detect Disease"}
        </Button>

        {/* Dynamic Error Block */}
        {error && (
          <div className="p-2 bg-destructive/10 text-destructive text-xs font-medium rounded-lg text-center border border-destructive/20">
            {error}
          </div>
        )}

        {/* Dynamic Result Block */}
        {result && (
          <div className="p-4 rounded-xl border shadow-sm bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
            <h3 className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider mb-2 border-b border-blue-200 dark:border-blue-800 pb-1">
              Analysis Complete
            </h3>
            <div className="space-y-1.5 mt-2">
              <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-2 rounded-md border border-slate-100 dark:border-slate-800">
                <span className="font-medium text-xs text-muted-foreground">Predicted Disease:</span>
                <span className="font-bold text-sm capitalize text-foreground">{result.disease}</span>
              </div>
              <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-2 rounded-md border border-slate-100 dark:border-slate-800">
                <span className="font-medium text-xs text-muted-foreground">Severity Level:</span>
                <span className="font-bold text-sm capitalize text-foreground">{result.severity}</span>
              </div>
            </div>
          </div>
        )}

        {/* Location Block */}
        <div className="space-y-1.5 pt-2">
          <Label htmlFor="location" className="text-xs">
            Your location (optional)
          </Label>
          <div className="flex gap-2">
            <Input
              id="location"
              placeholder="Enter address or area"
              value={locationAddress}
              onChange={(e) => onLocationAddressChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onLocationSubmit();
                }
              }}
            />
            <Button
              variant="outline"
              type="button"
              className="shrink-0"
              onClick={onGetCurrentLocation}
            >
              <MapPin className="h-4 w-4 mr-1.5" />
              Current
            </Button>
          </div>
        </div>

        {/* Dropdown Grid Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          <div className="space-y-1.5">
            <Label className="text-xs">Specialty</Label>
            <Select 
              onValueChange={(value) => {
                localStorage.setItem("telemedicine_filter", value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                <SelectItem value="general">General Medicine</SelectItem>
                <SelectItem value="cardio">Cardiology</SelectItem>
                <SelectItem value="neuro">Neurology</SelectItem>
                <SelectItem value="ortho">Orthopedics</SelectItem>
                <SelectItem value="pedia">Pediatrics</SelectItem>
                <SelectItem value="gastro">Gastroenterology</SelectItem>
                <SelectItem value="derm">Dermatology</SelectItem>
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
                <SelectItem value="public">Public Insurance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
        </div>
      </div>
    </section>
  );
}