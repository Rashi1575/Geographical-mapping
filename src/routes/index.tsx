import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Hospital,
  Map as MapIcon,
  Activity,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { SearchPanel } from "@/components/healthcare/SearchPanel";
import { RecommendationCard } from "@/components/healthcare/RecommendationCard";
import { MapSection } from "@/components/healthcare/MapSection";
import { recommendations } from "@/data/recommendations";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Home — Smart Healthcare Mapping System" },
      {
        name: "description",
        content:
          "Find the best nearby hospital, clinic, or mobile medical unit in an emergency — instantly.",
      },
    ],
  }),
  component: Home,
});

const stats = [
  { icon: Hospital, label: "Facilities", value: "1,248" },
  { icon: Activity, label: "Live now", value: "312" },
  { icon: Clock, label: "Avg. response", value: "7 min" },
  { icon: ShieldCheck, label: "ER ready", value: "184" },
];

function Home() {
  const [selectedHospital, setSelectedHospital] = useState(recommendations[0]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>("");

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          setUserLocation(coords);
          setLocationAddress("Current Location");
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to access your location. Please check permissions.");
        },
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleLocationAddressChange = (address: string) => {
    setLocationAddress(address);
  };

  const handleLocationSubmit = () => {
    if (!locationAddress.trim()) {
      alert("Please enter a location or use current location.");
      return;
    }

    // Simple geocoding - convert address to approximate coordinates
    // In a real app, use Google Maps Geocoding API or similar
    const geocodedLocation = geocodeAddress(locationAddress);
    if (geocodedLocation) {
      setUserLocation(geocodedLocation);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick links */}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_45%] gap-6">
        <div className="space-y-5 min-w-0">
          <SearchPanel
            locationAddress={locationAddress}
            onLocationAddressChange={handleLocationAddressChange}
            onGetCurrentLocation={handleGetCurrentLocation}
            onLocationSubmit={handleLocationSubmit}
          />

          <section>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-sm font-semibold text-foreground">
                Recommended Medical Facilities
              </h2>
              <span className="text-xs text-muted-foreground">
                {recommendations.length} matches
              </span>
            </div>
            <div className="space-y-3">
              {recommendations.map((rec) => (
                <RecommendationCard key={rec.id} rec={rec} onViewMap={setSelectedHospital} />
              ))}
            </div>
          </section>
        </div>

        <div className="min-w-0">
          <div className="space-y-4 sticky top-20">
            <MapSection selectedHospital={selectedHospital} userLocation={userLocation} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple geocoding function - converts known locations to coordinates
// In production, use Google Maps Geocoding API or similar
function geocodeAddress(address: string): [number, number] | null {
  const normalizedAddress = address.toLowerCase().trim();

  // Delhi landmarks and areas
  const geocodes: { [key: string]: [number, number] } = {
    // Major landmarks
    "india gate": [28.6129, 77.229],
    "taj mahal": [27.1751, 78.0421],
    "qutb minar": [28.5244, 77.1855],
    "humayun tomb": [28.5921, 77.2513],
    "red fort": [28.6562, 77.241],
    "parliament house": [28.6274, 77.1851],

    // Delhi areas
    "connaught place": [28.6315, 77.1851],
    "khan market": [28.5675, 77.2145],
    "dwarka": [28.5921, 77.041],
    "noida": [28.5355, 77.3910],
    "gurgaon": [28.4595, 77.0266],
    "south delhi": [28.5244, 77.1855],
    "north delhi": [28.7041, 77.1025],
    "east delhi": [28.6162, 77.3009],
    "west delhi": [28.6505, 77.0338],
    "central delhi": [28.6315, 77.1851],

    // Current location
    "current location": [28.6139, 77.209],
    "my location": [28.6139, 77.209],
  };

  // Try exact match
  if (geocodes[normalizedAddress]) {
    return geocodes[normalizedAddress];
  }

  // Try partial match
  for (const [key, coords] of Object.entries(geocodes)) {
    if (normalizedAddress.includes(key) || key.includes(normalizedAddress)) {
      return coords;
    }
  }

  // If address looks like coordinates (lat,lng format)
  const coordsMatch = address.match(/^([-\d.]+)\s*,\s*([-\d.]+)$/);
  if (coordsMatch) {
    const lat = parseFloat(coordsMatch[1]);
    const lng = parseFloat(coordsMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) {
      return [lat, lng];
    }
  }

  // Default to Delhi city center if address not recognized
  console.warn(`Location "${address}" not found, defaulting to Delhi center`);
  return [28.6139, 77.209];
}
