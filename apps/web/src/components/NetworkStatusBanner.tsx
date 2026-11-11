"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function NetworkStatusBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const update = () => setIsOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        left: 12,
        right: 12,
        bottom: "calc(12px + env(safe-area-inset-bottom))",
        zIndex: 200001,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "10px 14px",
        borderRadius: 10,
        background: "var(--warning-soft)",
        border: "1px solid var(--gold)",
        color: "var(--warning-fg)",
        fontSize: "0.82rem",
        boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
        pointerEvents: "none",
      }}
    >
      <WifiOff size={15} />
      Mode hors ligne : certaines actions sont indisponibles.
    </div>
  );
}
