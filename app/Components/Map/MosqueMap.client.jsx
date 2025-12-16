'use client';

import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import UserMarker from './UserMarker';
import MosqueMarkers from './MosqueMarkers';
import RoutePolyline from './PolyLine';
import MapController from './MapController';
const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;

export default function MosqueMapClient({
  userPos,
  radius,
  mosques,
  route,
  isRouting,
  onSelectMosque,
  selectedMosque,
}) {
  return (
    <MapContainer
      center={[-6.2, 106.8]}
      zoom={13}
      className='h-full w-full'
      zoomControl={false}
      dragging={!isRouting}
      scrollWheelZoom={!isRouting}
      doubleClickZoom={!isRouting}
      touchZoom={!isRouting}
    >
      <TileLayer
        url={`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`}
      />

      <UserMarker position={userPos} radius={radius} />
      <MosqueMarkers
        mosques={mosques}
        onSelect={onSelectMosque}
        selectedMosque={selectedMosque}
      />
      <RoutePolyline route={route} />
      <MapController
        userPos={userPos}
        route={route}
        isRouting={isRouting}
        selectedMosque={selectedMosque}
      />
    </MapContainer>
  );
}
