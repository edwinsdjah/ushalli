import React from 'react';
import { LocateFixed, RefreshCw, CheckCircle, MapPin } from 'lucide-react';

const UpdateLocationButton = ({ onUpdate, loading, locationStatus }) => {
  let bgClass = 'bg-[var(--color-royal)] hover:bg-purple-700';
  let textClass = 'text-white';

  if (loading) {
    bgClass = 'bg-gray-500 cursor-not-allowed';
  } else if (locationStatus === 'same') {
    bgClass = 'bg-gray-300';
    textClass = 'text-gray-800';
  } else if (locationStatus === 'different') {
    bgClass = 'bg-yellow-500 hover:bg-yellow-600';
    textClass = 'text-white';
  }

  return (
    <button
      onClick={onUpdate}
      disabled={loading}
      className={`px-5 py-3 rounded-2xl font-semibold shadow-md transition-all transform
        ${bgClass} ${textClass}
        ${!loading && 'hover:scale-105 active:scale-95'}
      `}
    >
      {loading ? (
        <RefreshCw className="w-5 h-5 animate-spin" />
      ) : locationStatus === 'same' ? (
        <MapPin className="w-5 h-5" />
      ) : locationStatus === 'different' ? (
        <CheckCircle className="w-5 h-5" />
      ) : (
        <LocateFixed className="w-5 h-5" />
      )}
    </button>
  );
};

export default UpdateLocationButton;
