import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Map from './components/Map';
import { calculateDistance } from './utils/distance';
import hospitalData from './data/hospitals_data.json';

function App() {
  const [userLocation, setUserLocation] = useState(null);
  const [radius, setRadius] = useState(5); // Default radius in km
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const handleLocationUpdate = (loc, loading = false) => {
    if (loading) {
      setIsLoadingLocation(true);
    } else {
      setUserLocation(loc);
      setSelectedHospital(null); // Reset selected hospital when location changes
      setIsLoadingLocation(false);
    }
  };

  // Filter and sort hospitals whenever location or radius changes
  const nearbyHospitals = useMemo(() => {
    if (!userLocation) return [];

    return hospitalData
      .map(hospital => ({
        ...hospital,
        distance: calculateDistance(
          userLocation.lat,
          userLocation.lng,
          hospital.Latitude,
          hospital.Longitude
        )
      }))
      .filter(hospital => hospital.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
  }, [userLocation, radius]);

  const handleHospitalClick = (hospital) => {
    setSelectedHospital(hospital);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-gray-100 overflow-hidden font-sans">
      <Sidebar 
        userLocation={userLocation}
        onLocationUpdate={handleLocationUpdate}
        radius={radius}
        onRadiusChange={setRadius}
        hospitals={nearbyHospitals}
        onHospitalClick={handleHospitalClick}
        isLoadingLocation={isLoadingLocation}
      />
      <div className="flex-1 h-[50vh] md:h-full relative">
        <Map 
          userLocation={userLocation} 
          radius={radius} 
          hospitals={nearbyHospitals}
          selectedHospital={selectedHospital}
        />
      </div>
    </div>
  );
}

export default App;
