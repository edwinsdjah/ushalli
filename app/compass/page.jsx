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

  useEffect(() => {
    if (!coords) {
      setLoading(false);
      return;
    }
    const q = calculateQiblaDirection(coords.lat, coords.lon);
    setQibla(q);
    setLoading(false);
  }, [coords]);

  // Sensor kompas
  useEffect(() => {
    if (!window.DeviceOrientationEvent) return;

    const handle = (e) => {
      let d = e.alpha;
      if (typeof e.webkitCompassHeading === "number") {
        d = e.webkitCompassHeading;
      }
      setHeading(d || 0);
    };

    window.addEventListener("deviceorientation", handle, true);
    return () => window.removeEventListener("deviceorientation", handle);
  }, []);

  const angleToQibla = qibla !== null ? (qibla - heading + 360) % 360 : 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-200">
      <Card className="w-full max-w-sm shadow-xl rounded-2xl border-none bg-gray-100">
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold">
            Kompas Kiblat 3D
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-8">

          {loading ? (
            <Loader2 className="animate-spin" />
          ) : !coords ? (
            <p className="text-center text-sm text-gray-500">
              Lokasi belum ditemukan. Silakan ambil lokasi di halaman utama.
            </p>
          ) : (
            <>
              {/* 🧭 Kompas 3D */}
              <div className="relative w-72 h-72 flex items-center justify-center">

                {/* Lingkaran kompas 3D */}
                <div className="
                  absolute inset-0 rounded-full 
                  bg-gray-100 
                  shadow-[inset_8px_8px_16px_#c8c8c8,inset_-8px_-8px_16px_white]
                  border border-gray-300
                " />

                {/* Lapisan kedua 3D */}
                <div className="
                  absolute inset-4 rounded-full 
                  bg-gray-100 
                  shadow-[inset_4px_4px_12px_#c8c8c8,inset_-4px_-4px_12px_white]
                " />

                {/* N E S W */}
                <span className="absolute top-3 font-bold text-gray-700">N</span>
                <span className="absolute bottom-3 font-bold text-gray-700">S</span>
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-700">W</span>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-gray-700">E</span>

                {/* 🔵 Jarum Kompas - Arah Utara */}
                <div
                  className="absolute w-52 h-52 flex items-center justify-center transition-transform duration-200"
                  style={{ transform: `rotate(${360 - heading}deg)` }}
                >
                  <div className="w-1.5 h-24 bg-blue-500 rounded-full shadow-lg opacity-70" />
                </div>

                {/* 🟥 Jarum Kiblat (dengan 3D effect) */}
                <div
                  className="absolute w-52 h-52 flex items-center justify-center transition-transform duration-300"
                  style={{ transform: `rotate(${angleToQibla}deg)` }}
                >
                  <div className="relative flex flex-col items-center">
                    <div className="
                      w-2 h-28 
                      bg-gradient-to-b from-red-600 to-red-400 
                      shadow-[0_4px_10px_rgba(255,0,0,0.4)]
                      rounded-full
                    " />

                    {/* 🕋 Ikon Ka'bah */}
                    <div className="
                      absolute -bottom-6 
                      w-8 h-8 
                      bg-black 
                      rounded-[6px] 
                      flex items-center justify-center
                      shadow-lg
                      border border-yellow-500
                    ">
                      <span className="text-yellow-400 text-xs font-bold">
                        🕋
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Info */}
              <div className="text-center text-sm">
                <p><b>Arah Kiblat:</b> {qibla.toFixed(1)}°</p>
                <p><b>Heading:</b> {heading.toFixed(1)}°</p>
                <p><b>Rotasi ke Kiblat:</b> {angleToQibla.toFixed(1)}°</p>
              </div>

            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
