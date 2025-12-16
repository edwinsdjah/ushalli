import { Marker, Popup, Circle } from 'react-leaflet';
import FlyTo from './FlyTo';
import { userDivIcon } from '../../../utils/icons/user';

export default function UserMarker({ position, radius }) {
  if (!position) return null;

  const latlng = [position.lat, position.lon];

  return (
    <>
      <FlyTo position={latlng} />

      <Marker position={latlng} icon={userDivIcon} zIndexOffset={1000}>
        <Popup>Lokasi Anda</Popup>
      </Marker>

      {radius && (
        <Circle
          center={latlng}
          radius={radius}
          pathOptions={{ opacity: 0.3 }}
        />
      )}
    </>
  );
}
