import { Polyline } from 'react-leaflet';

export default function RoutePolyline({ route }) {
  if (!route) return null;

  return (
    <Polyline positions={route} pathOptions={{ weight: 5, color: 'purple' }} />
  );
}
