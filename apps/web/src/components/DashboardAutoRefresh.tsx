"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Actualisation automatique du tableau de bord global.
 * Les données sont rechargées côté serveur toutes les 30 secondes, ce qui permet
 * à la Comptable principale et à la Direction de suivre l'évolution des activités
 * sans recharger manuellement la page.
 */
export function DashboardAutoRefresh() {
  const router = useRouter();
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => {
      router.refresh();
      setLastRefresh(new Date());
    }, 30_000);
    return () => window.clearInterval(id);
  }, [router]);

  return (
    <span
      title="Les indicateurs sont actualisés automatiquement toutes les 30 secondes."
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: "0.75rem",
        opacity: 0.7,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "var(--success-solid)",
          boxShadow: "0 0 0 3px rgba(52,211,153,0.15)",
        }}
      />
      Temps réel{lastRefresh ? ` · actualisé à ${lastRefresh.toLocaleTimeString("fr-FR")}` : " · actualisation automatique"}
    </span>
  );
}
