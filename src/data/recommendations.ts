export type Recommendation = {
  id: string;
  name: string;
  rating: number;
  distanceKm: number;
  travelTimeMin: number;
  specialty: string;
  emergency: boolean;
  aiRecommended: boolean;
  address: string;
  lat: number;
  lng: number;
};

export const recommendations: Recommendation[] = [
  {
    id: "city-care",
    name: "City Care Hospital",
    rating: 4.7,
    distanceKm: 1.8,
    travelTimeMin: 7,
    specialty: "Cardiology",
    emergency: true,
    aiRecommended: true,
    address: "12 Linden Ave, Sector 4",
    lat: 28.6219,
    lng: 77.21,
  },
  {
    id: "metro-health",
    name: "Metro Health Centre",
    rating: 4.5,
    distanceKm: 2.6,
    travelTimeMin: 11,
    specialty: "General Medicine",
    emergency: true,
    aiRecommended: true,
    address: "88 Riverside Rd",
    lat: 28.608,
    lng: 77.225,
  },
  {
    id: "sunrise-medical",
    name: "Sunrise Medical Institute",
    rating: 4.3,
    distanceKm: 3.9,
    travelTimeMin: 15,
    specialty: "Trauma & Orthopedics",
    emergency: false,
    aiRecommended: true,
    address: "5 Park Crescent",
    lat: 28.605,
    lng: 77.195,
  },
];

export const routeInfo = {
  selectedHospital: "City Care Hospital",
  distance: "1.8 km",
  travelTime: "7 min",
  arrival: "10:42 AM",
  status: "Awaiting selection",
};
