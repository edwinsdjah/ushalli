"use client";

export default function LocationModal({ open, onAllow, onIgnore }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl w-80 shadow-lg">
        <h2 className="text-lg font-bold mb-2">Izinkan Akses Lokasi</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">
          Kami membutuhkan lokasi Anda untuk menampilkan jadwal sholat yang akurat.
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onIgnore}
            className="px-4 py-2 rounded-md border text-sm"
          >
            Nanti saja
          </button>

          <button
            onClick={onAllow}
            className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm"
          >
            Izinkan
          </button>
        </div>
      </div>
    </div>
  );
}
