import React, { useState } from 'react';
import { Crosshair, Search, SlidersHorizontal, Map as MapIcon, Activity } from 'lucide-react';
import HospitalCard from './HospitalCard';

const Sidebar = ({ 
  userLocation, 
  onLocationUpdate, 
  radius, 
  onRadiusChange, 
  hospitals, 
  onHospitalClick,
  isLoadingLocation
}) => {
  const [manualLat, setManualLat] = useState(userLocation?.lat || '');
  const [manualLng, setManualLng] = useState(userLocation?.lng || '');
  const [showFilters, setShowFilters] = useState(false);

  // Update local state if userLocation prop changes externally (e.g. via Locate Me)
  React.useEffect(() => {
    if (userLocation) {
      setManualLat(userLocation.lat);
      setManualLng(userLocation.lng);
    }
  }, [userLocation]);

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (manualLat && manualLng) {
      onLocationUpdate({ lat: parseFloat(manualLat), lng: parseFloat(manualLng) });
    }
  };

  const requestLocation = () => {
    if (navigator.geolocation) {
      onLocationUpdate(null, true); // Set loading state
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onLocationUpdate({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location", error);
          alert("Unable to retrieve your location. Please check permissions or enter manually.");
          onLocationUpdate(userLocation); // Reset loading state
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  return (
    <div className="w-full md:w-[400px] bg-white h-screen flex flex-col shadow-xl z-20 relative">
      {/* Header */}
      <div className="p-6 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-br-3xl shadow-lg">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
            <Activity size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">CareFinder</h1>
        </div>
        
        <form onSubmit={handleManualSearch} className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1 space-y-2">
              <input
                type="number"
                step="any"
                placeholder="Latitude"
                value={manualLat}
                onChange={(e) => setManualLat(e.target.value)}
                className="w-full bg-white/10 border border-white/20 text-white placeholder-white/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                required
              />
              <input
                type="number"
                step="any"
                placeholder="Longitude"
                value={manualLng}
                onChange={(e) => setManualLng(e.target.value)}
                className="w-full bg-white/10 border border-white/20 text-white placeholder-white/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-white text-primary-600 rounded-lg px-4 flex flex-col items-center justify-center hover:bg-primary-50 transition-colors font-medium shadow-sm"
            >
              <Search size={20} className="mb-1" />
              <span className="text-xs">Search</span>
            </button>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={requestLocation}
              disabled={isLoadingLocation}
              className="flex items-center space-x-2 text-sm font-medium bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
            >
              <Crosshair size={16} className={isLoadingLocation ? "animate-spin" : ""} />
              <span>{isLoadingLocation ? "Locating..." : "Locate Me"}</span>
            </button>
            
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${showFilters ? 'bg-white text-primary-600 shadow-inner' : 'bg-white/10 hover:bg-white/20'}`}
            >
              <SlidersHorizontal size={16} />
              <span>{radius} km</span>
            </button>
          </div>
        </form>

        {/* Filter Dropdown (Animated) */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showFilters ? 'max-h-24 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
          <div className="bg-black/10 p-3 rounded-lg backdrop-blur-md">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-medium text-white/90">Search Radius</label>
              <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded text-white">{radius} km</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="20" 
              step="1"
              value={radius}
              onChange={(e) => onRadiusChange(parseInt(e.target.value))}
              className="w-full accent-white h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-white/60 mt-1.5">
              <span>1 km</span>
              <span>20 km</span>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="flex-1 flex flex-col bg-[#f8fafc] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-md flex justify-between items-center z-10">
          <h2 className="text-sm font-semibold text-gray-700">
            Nearby Hospitals
          </h2>
          <span className="bg-primary-50 text-primary-600 py-1 px-2.5 rounded-full text-xs font-bold shadow-sm border border-primary-100">
            {hospitals.length} found
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-3 relative">
          {hospitals.length > 0 ? (
            hospitals.map((h, i) => (
              <HospitalCard key={i} hospital={h} onCardClick={onHospitalClick} />
            ))
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <MapIcon size={32} className="text-gray-400" strokeWidth={1.5} />
              </div>
              <p className="text-gray-600 font-medium text-sm">No hospitals found</p>
              <p className="text-xs mt-1">Try increasing your search radius or moving your location.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
