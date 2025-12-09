"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useLocationContext } from "@/app/context/locationContext";

// Hitung Arah Kiblat
function calculateQiblaDirection(lat, lon) {
  const kaabaLat = 21.4225;
  const kaabaLon = 39.8262;

  const radLat = (lat * Math.PI) / 180;
  const radKaabaLat = (kaabaLat * Math.PI) / 180;
  const deltaLon = ((kaabaLon - lon) * Math.PI) / 180;

  const y = Math.sin(deltaLon);
  const x =
    Math.cos(radLat) * Math.tan(radKaabaLat) -
    Math.sin(radLat) * Math.cos(deltaLon);

  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

export default function CompassPage() {
  const { coords } = useLocationContext();

  const [heading, setHeading] = useState(0);
  const [qibla, setQibla] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    if (!coords) {
      setLoading(false);
      return;
    }
    const q = calculateQiblaDirection(coords.lat, coords.lon);
    setQibla(q);
    setLoading(false);
  }, [coords]);

  // REAL-TIME SENSOR
  useEffect(() => {
    if (!permissionGranted) return;

    const handler = (e) => {
      let d = e.alpha;

      // iPhone
      if (typeof e.webkitCompassHeading === "number") {
        d = e.webkitCompassHeading;
      }

      if (d !== null && d !== undefined) {
        setHeading(d);
      }
    };

    window.addEventListener("deviceorientation", handler, true);
    return () => window.removeEventListener("deviceorientation", handler);
  }, [permissionGranted]);

  // Button untuk aktifkan sensor
  const requestPermission = async () => {
    try {
      if (DeviceOrientationEvent?.requestPermission) {
        const res = await DeviceOrientationEvent.requestPermission();
        if (res === "granted") setPermissionGranted(true);
      } else {
        // Android Chrome tanpa need permission
        setPermissionGranted(true);
      }
    } catch (e) {
      console.error("Permission failed", e);
    }
  };

  const angleToQibla =
    qibla !== null ? (qibla - heading + 360) % 360 : 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-200">
      <Card className="w-full max-w-sm shadow-xl rounded-2xl border-none bg-gray-100">
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold">
            Kompas Kiblat Real-Time
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-6">

          {!permissionGranted && (
            <button
              onClick={requestPermission}
              className="px-4 py-2 bg-black text-white rounded-lg"
            >
              Aktifkan Sensor Kompas
            </button>
          )}

          {loading ? (
            <Loader2 className="animate-spin" />
          ) : !coords ? (
            <p className="text-center text-sm">Lokasi belum tersedia.</p>
          ) : (
            <>
              <div className="relative w-72 h-72 flex items-center justify-center">
                {/* Kompas 3D Background */}
                <div className="
                  absolute inset-0 rounded-full 
                  bg-gray-100 
                  shadow-[inset_8px_8px_16px_#c8c8c8,inset_-8px_-8px_16px_white]
                " />

                {/* Jarum Utara (biru) */}
                <div
                  className="absolute w-52 h-52 flex items-center justify-center transition-transform duration-150"
                  style={{ transform: `rotate(${360 - heading}deg)` }}
                >
                  <div className="w-1.5 h-24 bg-blue-500 rounded-full shadow-lg" />
                </div>

                {/* Jarum Kiblat (merah) + Ka'bah */}
                <div
                  className="absolute w-52 h-52 flex items-center justify-center transition-transform duration-150"
                  style={{ transform: `rotate(${angleToQibla}deg)` }}
                >
                  <div className="relative flex flex-col items-center">
                    <div className="w-2 h-28 bg-red-500 rounded-full shadow-xl" />

                    <div className="
                      absolute -bottom-6 w-8 h-8 bg-black rounded-lg
                      flex items-center justify-center border border-yellow-500
                    ">
                      🕋
                    </div>
                  </div>
                </div>

              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
