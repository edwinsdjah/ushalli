'use client';

import { useEffect, useState } from 'react';
import { getNextPrayer, getCurrentPrayer } from './helpers';

export default function usePrayerCountdown(prayers) {
  const [countdown, setCountdown] = useState('');
  const [nextPrayer, setNextPrayer] = useState('');
  const [currentPrayer, setCurrentPrayer] = useState('');

  useEffect(() => {
    if (!prayers || Object.keys(prayers).length === 0) {
      setCountdown('--:--:--');
      setNextPrayer(null);
      setCurrentPrayer(null);
      return;
    }

    const tick = () => {
      const now = new Date();
      const next = getNextPrayer(prayers, now);
      const current = getCurrentPrayer(prayers, now);

      if (!next?.time || isNaN(next.time)) {
        setCountdown('--:--:--');
        setNextPrayer(null);
        setCurrentPrayer(current);
        return;
      }

      const diff = next.time - now;

      if (diff <= 0) {
        setCountdown('--:--:--');
        setNextPrayer(next.name);
        setCurrentPrayer(current);
        return;
      }

      const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');

      setCountdown(`${h}:${m}:${s}`);
      setNextPrayer(next.name);
      setCurrentPrayer(current);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [prayers]);

  return { countdown, nextPrayer, currentPrayer };
}
