import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Building2, Navigation } from 'lucide-react';
import { renderToString } from 'react-dom/server';

// Fix Leaflet's default icon path issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom icons using Lucide icons rendered to string
const createCustomIcon = (IconComponent, colorClass, bgClass) => {
  const iconHtml = renderToString(
    <div className={`w-8 h-8 rounded-full ${bgClass} border-2 border-white shadow-lg flex items-center justify-center`}>
      <IconComponent size={16} className={colorClass} />
    </div>
  );
  
  return L.divIcon({
    html: iconHtml,
    className: 'custom-div-icon bg-transparent border-none',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

const userIcon = createCustomIcon(Navigation, 'text-white', 'bg-blue-600 animate-pulse');
const hospitalIcon = createCustomIcon(Building2, 'text-white', 'bg-rose-500');

// Component to handle map centering and flying
const MapController = ({ center, selectedHospital }) => {
  const map = useMap();
  
  useEffect(() => {
    if (selectedHospital) {
      map.flyTo([selectedHospital.Latitude, selectedHospital.Longitude], 16, {
        duration: 1.5
      });
    } else if (center) {
      map.flyTo([center.lat, center.lng], 13, {
        duration: 1.5
      });
    }
  }, [center, selectedHospital, map]);

  return null;
};

const Map = ({ userLocation, radius, hospitals, selectedHospital }) => {
  const defaultCenter = { lat: 28.6139, lng: 77.2090 }; // New Delhi default
  const center = userLocation || defaultCenter;
  const mapRef = useRef(null);
  const markerRefs = useRef({});

  // Open popup when a hospital is selected from sidebar
  useEffect(() => {
    if (selectedHospital && markerRefs.current[selectedHospital['Hospital Name']]) {
      // Small delay to allow flyTo to start
      setTimeout(() => {
        const marker = markerRefs.current[selectedHospital['Hospital Name']];
        if (marker) {
          marker.openPopup();
        }
      }, 500);
    }
  }, [selectedHospital]);

  return (
    <div className="w-full h-full relative z-0 bg-gray-100">
      <MapContainer 
        center={[center.lat, center.lng]} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        <MapController center={userLocation} selectedHospital={selectedHospital} />

        {userLocation && (
          <>
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
              <Popup className="custom-popup border-none p-0">
                <div className="p-3 bg-white text-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Navigation size={16} className="text-blue-600" />
                  </div>
                  <p className="font-semibold text-gray-800 text-sm">You are here</p>
                </div>
              </Popup>
            </Marker>
            
            {/* Radius Circle */}
            <Circle 
              center={[userLocation.lat, userLocation.lng]} 
              radius={radius * 1000} // Convert km to meters
              pathOptions={{ 
                color: '#3b82f6', 
                fillColor: '#3b82f6', 
                fillOpacity: 0.08,
                weight: 1,
                dashArray: '4, 6'
              }} 
            />
          </>
        )}

        {hospitals.map((hospital, index) => (
          <Marker 
            key={index} 
            position={[hospital.Latitude, hospital.Longitude]} 
            icon={hospitalIcon}
            ref={(ref) => {
              if (ref) {
                markerRefs.current[hospital['Hospital Name']] = ref;
              }
            }}
          >
            <Popup className="custom-popup min-w-[220px]">
              <div className="bg-white">
                <div className="bg-rose-500 text-white px-4 py-3">
                  <h3 className="font-bold text-sm leading-tight">{hospital['Hospital Name']}</h3>
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-600 mb-3">{hospital.Address}</p>
                  <div className="bg-gray-50 rounded-lg p-2 inline-flex items-center space-x-2">
                    <Navigation size={14} className="text-primary-600" />
                    <span className="text-sm font-semibold text-primary-700">{hospital.distance.toFixed(2)} km away</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        
      </MapContainer>
    </div>
  );
};

export default Map;
