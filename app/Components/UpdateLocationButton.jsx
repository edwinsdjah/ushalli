import React from "react";

const UpdateLocationButton = ({ onUpdate, loading, locationStatus }) => {
  let buttonText = "Perbarui Lokasi Anda";

  if (loading) buttonText = "Loading...";
  else if (locationStatus === "same") buttonText = "Koordinat Lokasi masih sama";
  else if (locationStatus === "different")
    buttonText = "Lokasi berhasil diperbarui";

  return (
    <button
      onClick={onUpdate}
      disabled={loading}
      className={`px-4 py-2 rounded text-white transition 
        ${loading ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"}
      `}
    >
      {buttonText}
    </button>
  );
};

export default UpdateLocationButton;
