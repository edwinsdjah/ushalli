import { Marker, Popup, Circle } from 'react-leaflet';
import FlyTo from './FlyTo';
import { userDivIcon } from '../../../utils/icons/user';

export default function UserMarker({ position, radius }) {
  if (!position) return null;

  return (
    <>
      <FlyTo position={position} />
      <Marker position={position} icon={userDivIcon} zIndexOffset={1000}>
        <Popup>Lokasi Anda</Popup>
      </Marker>
      <Circle center={position} radius={radius} />
    </>
  );
}
