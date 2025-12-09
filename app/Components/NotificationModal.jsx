"use client";

import { useEffect, useState } from "react";

export default function NotificationModal({ onAllow, onIgnore, open }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Cek apakah user sudah pernah menjawab modal
    const asked = localStorage.getItem("ushalli_notif_asked");
    if (!asked) {
      setShow(true);
    }
  }, []);

  function closeModal() {
    setShow(false);
    localStorage.setItem("ushalli_notif_asked", "1");
  }

  async function handleAllow() {
    await onAllow();
    closeModal();
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-xl max-w-sm w-full animate-scaleIn">
        <h3 className="text-xl font-bold mb-3 text-center">
          Izinkan Notifikasi Shalat?
        </h3>
        <p className="text-center text-sm opacity-80 mb-6">
          Kami akan mengirimkan pengingat waktu shalat tepat waktu langsung ke
          perangkat Anda.
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={closeModal}
            className="px-4 py-2 rounded-xl bg-neutral-300 dark:bg-neutral-700"
          >
            Nanti saja
          </button>

          <button
            onClick={handleAllow}
            className="px-4 py-2 rounded-xl bg-green-600 text-white"
          >
            Izinkan
          </button>
        </div>
      </div>

      <style jsx>{`
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1);
          }
        }
      `}</style>
    </div>
  );
}
