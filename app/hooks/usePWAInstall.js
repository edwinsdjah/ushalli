"use client";

import { useEffect, useState } from "react";

let deferredPrompt = null;

export default function usePWAInstall() {
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      deferredPrompt = e;
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      deferredPrompt = null;
      setCanInstall(false);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    deferredPrompt = null;
    setCanInstall(false);

    return choice?.outcome; // accepted | dismissed
  };

  return { canInstall, install };
}
