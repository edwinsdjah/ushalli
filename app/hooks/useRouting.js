import { useState } from 'react';
import { fetchRoute } from '@/services/geoapify';

export function useRouting(userPos) {
  const [route, setRoute] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastOrigin, setLastOrigin] = useState(null);

  const routeTo = async (destPos, mode) => {
    if (!userPos) return;
    setIsLoading(true);
    try {
      const result = await fetchRoute({
        from: userPos,
        to: destPos,
        mode,
      });
      setRoute(result.coords);
      setRouteInfo(result.info);
      setLastOrigin(userPos);
    } catch (error) {
      console.error('Failed to fetch route:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearRoute = () => {
    setRoute(null);
    setRouteInfo(null);
    setLastOrigin(null);
    setIsLoading(false);
  };

  return { route, routeInfo, routeTo, clearRoute, isLoading, lastOrigin };
}
