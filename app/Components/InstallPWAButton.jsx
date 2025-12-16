"use client";

import { Download } from "lucide-react";
import usePWAInstall from "@/app/hooks/usePWAInstall";

export default function InstallPWAButton() {
  const { canInstall, install } = usePWAInstall();

  if (!canInstall) return null;

  return (
    <button
      onClick={install}
      className="px-5 py-3 rounded-2xl font-semibold shadow-md
                 bg-[var(--color-royal)] text-white
                 hover:bg-purple-700 transition-all
                 hover:scale-105 active:scale-95"
    >
      <div className="flex items-center gap-2">
        <Download className="w-5 h-5" />
        Install App
      </div>
    </button>
  );
}
