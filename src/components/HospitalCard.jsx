import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

const HospitalCard = ({ hospital, onCardClick }) => {
  return (
    <div 
      onClick={() => onCardClick(hospital)}
      className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-100 transition-all cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">
          {hospital['Hospital Name']}
        </h3>
        <div className="flex items-center space-x-1 bg-primary-50 text-primary-700 px-2 py-1 rounded-md text-xs font-medium shrink-0 ml-2">
          <Navigation size={12} />
          <span>{hospital.distance.toFixed(2)} km</span>
        </div>
      </div>
      <div className="flex items-start text-gray-500 text-sm">
        <MapPin size={16} className="mr-1.5 mt-0.5 shrink-0 text-gray-400" />
        <p className="line-clamp-2">{hospital.Address}</p>
      </div>
    </div>
  );
};

export default HospitalCard;
