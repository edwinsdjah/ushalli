const GEOAPIFY_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_KEY;

export async function fetchNearbyMosques({ lat, lon, radius }) {
  const url = `https://api.geoapify.com/v2/places?categories=religion.place_of_worship.islam&filter=circle:${lon},${lat},${radius}&limit=50&apiKey=${GEOAPIFY_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  console.log(data);

  return data.features.map(m => ({
    id: m.properties.place_id,
    name: m.properties.name || 'Masjid',
    address: m.properties.address_line2 || m.properties.address_line1 || '',
    position: [m.geometry.coordinates[1], m.geometry.coordinates[0]],
  }));
}

export async function fetchRoute({ from, to, mode }) {
  const url = `https://api.geoapify.com/v1/routing?waypoints=${from.lat},${from.lon}|${to[0]},${to[1]}&mode=${mode}&apiKey=${GEOAPIFY_KEY}`;

  const res = await fetch(url);
  const data = await res.json();
  console.log(data);

  if (!data.features?.length) {
    throw new Error('Routing data not found');
  }

  const geometry = data.features[0].geometry;

  let coords = [];

  if (geometry.type === 'LineString') {
    coords = geometry.coordinates.map(c => [c[1], c[0]]);
  }

  if (geometry.type === 'MultiLineString') {
    coords = geometry.coordinates.flat().map(c => [c[1], c[0]]);
  }

  return {
    coords,
    info: {
      distance: data.features[0].properties.distance,
      time: Math.round(data.features[0].properties.time / 60),
      mode,
    },
  };
}
