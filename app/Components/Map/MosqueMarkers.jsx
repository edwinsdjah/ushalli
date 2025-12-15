import { Marker, Popup } from 'react-leaflet';
import { mosqueDivIcon } from '../../../utils/icons/mosque';
import { mosqueActiveDivIcon } from '../../../utils/icons/mosqueActive';

export default function MosqueMarkers({ mosques, onSelect, selectedMosque }) {
  return mosques.map(m => (
    <Marker
      key={m.id}
      position={m.position}
      eventHandlers={{
        click: () => onSelect(m),
      }}
      icon={selectedMosque?.id === m.id ? mosqueActiveDivIcon : mosqueDivIcon}
    />
  ));
}
