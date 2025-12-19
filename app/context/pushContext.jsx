"use client";

import { createContext, useContext } from "react";
import usePushNotification from "@/app/hooks/usePushNotification";

const PushContext = createContext(null);

export function PushProvider({ children }) {
  const push = usePushNotification();
  return (
    <PushContext.Provider value={push}>
      {children}
    </PushContext.Provider>
  );
}

export const usePush = () => useContext(PushContext);
