import { useState } from 'react';
import { fetchRoute } from '@/services/geoapify';

export function useRouting(userPos) {
  const [route, setRoute] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);

  const routeTo = async (destPos, mode) => {
    if (!userPos) return;
    const result = await fetchRoute({
      from: userPos,
      to: destPos,
      mode,
    });
    setRoute(result.coords);
    setRouteInfo(result.info);
  };

  const clearRoute = () => {
    setRoute(null);
    setRouteInfo(null);
  };

  return { route, routeInfo, routeTo, clearRoute };
}
