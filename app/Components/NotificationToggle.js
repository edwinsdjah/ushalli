'use client';

import { Bell, BellOff, BellRing } from 'lucide-react';
import InstallPWAButton from './InstallPWAButton';
import { usePush } from '../context/pushContext';

export default function NotificationToggle() {
  const {
    isSupported,
    permission,
    isSubscribed,
    subscribeToPush,
    unsubscribeFromPush,
    loading,
  } = usePush();

  if (!isSupported) {
    return (
      <div className='flex flex-col gap-2'>
        <p className='text-sm text-red-500'>
          Browser kamu tidak mendukung push notification.
          <br />
          Silahkan install sebagai PWA.
        </p>
        <InstallPWAButton />
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <p className='text-sm text-red-500'>
        Kamu menolak notifikasi. Aktifkan kembali dari pengaturan browser.
      </p>
    );
  }

  const handleToggle = async () => {
    if (loading) return;
    isSubscribed ? await unsubscribeFromPush() : await subscribeToPush();
  };

  let bgClass = 'bg-[var(--color-royal)] hover:bg-purple-700 text-white';
  if (loading) bgClass = 'bg-gray-500 cursor-not-allowed text-white';
  else if (isSubscribed)
    bgClass =
      'bg-[var(--color-royal-accent)] hover:bg-[#e0b86f] text-purple-900'; // Gold with dark text

  return (
    <button
      disabled={loading}
      onClick={handleToggle}
      className={`px-5 py-3 rounded-2xl font-semibold shadow-md transition-all flex items-center gap-2
        ${bgClass} ${!loading && 'hover:scale-105 active:scale-95'}`}
    >
      {loading ? (
        'Processing...'
      ) : isSubscribed ? (
        <>
          <BellRing className='w-5 h-5' />
        </>
      ) : (
        <Bell className='w-5 h-5' />
      )}
    </button>
  );
}
