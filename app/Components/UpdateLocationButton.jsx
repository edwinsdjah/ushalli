import React from 'react';

const UpdateLocationButton = ({ onUpdate, loading, locationStatus }) => {
  let buttonText = 'Perbarui Lokasi Anda';

  if (loading) buttonText = 'Loading...';
  else if (locationStatus === 'same')
    buttonText = 'Koordinat Lokasi masih sama';
  else if (locationStatus === 'different')
    buttonText = 'Lokasi berhasil diperbarui';

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
      {buttonText}
    </button>
  );
};

export default UpdateLocationButton;
