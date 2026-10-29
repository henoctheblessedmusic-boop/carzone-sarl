"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Zap,
  BatteryCharging,
  Smartphone,
  CreditCard,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { formatXof } from "@/lib/format";

type Station = {
  id: string;
  code: string;
  name: string;
  address: string | null;
  powerKw: number | null;
};

type Customer = {
  id: string;
  contactName: string;
  companyName: string | null;
  phone: string | null;
  isSubscriber: boolean;
  planName: string | null;
  kwhPriceXof: number;
};

export default function TerminalPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stationId, setStationId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [kwh, setKwh] = useState<number>(30);
  const [method, setMethod] = useState<"MTN_MOMO" | "MOOV_MONEY" | "CARTE">("MTN_MOMO");
  const [phone, setPhone] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [ussdStep, setUssdStep] = useState<"IDLE" | "PUSH_SENT" | "PIN_ENTERED" | "SUCCESS">("IDLE");
  const [resultData, setResultData] = useState<{
    invoiceNumber: string;
    totalXof: number;
    pricePerKwh: number;
    savingsXof: number;
    kwh: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/terminal/meta")
      .then((r) => r.json())
      .then((data) => {
        setStations(data.stations || []);
        setCustomers(data.customers || []);
        if (data.stations?.[0]) setStationId(data.stations[0].id);
      })
      .catch(() => setError("Erreur de connexion au réseau des bornes CARZONE"));
  }, []);

  const selectedStation = stations.find((s) => s.id === stationId);
  const selectedCustomer = customers.find((c) => c.id === customerId);

  const pricePerKwh = selectedCustomer?.isSubscriber ? selectedCustomer.kwhPriceXof : 125;
  const publicPricePerKwh = 125;
  const totalXof = Math.round(kwh * pricePerKwh);
  const publicTotalXof = Math.round(kwh * publicPricePerKwh);
  const savingsXof = Math.max(0, publicTotalXof - totalXof);

  // Update suggested phone when customer changes
  useEffect(() => {
    if (selectedCustomer?.phone) {
      setPhone(selectedCustomer.phone);
    }
  }, [selectedCustomer]);

  async function handleLaunchPayment() {
    if (!stationId) {
      setError("Veuillez sélectionner une borne active.");
      return;
    }
    if (kwh <= 0) {
      setError("Veuillez sélectionner une quantité de kWh positive.");
      return;
    }

    setError(null);
    setLoading(true);

    if (method === "MTN_MOMO" || method === "MOOV_MONEY") {
      setUssdStep("PUSH_SENT");
      setTimeout(() => {
        setUssdStep("PIN_ENTERED");
        setTimeout(async () => {
          await finalizeApiPayment();
        }, 1200);
      }, 1800);
    } else {
      await finalizeApiPayment();
    }
  }

  async function finalizeApiPayment() {
    try {
      const res = await fetch("/api/terminal/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stationId,
          customerId: customerId || null,
          kwh: Number(kwh),
          method: method === "CARTE" ? "CARTE" : "MOBILE_MONEY",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Échec du paiement.");
        setUssdStep("IDLE");
      } else {
        setResultData({
          invoiceNumber: data.invoiceNumber,
          totalXof: data.totalXof,
          pricePerKwh: data.pricePerKwh,
          savingsXof,
          kwh,
        });
        setUssdStep("SUCCESS");
      }
    } catch {
      setError("Erreur réseau lors de la validation.");
      setUssdStep("IDLE");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setUssdStep("IDLE");
    setResultData(null);
    setKwh(30);
    setError(null);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at top, #0d2822 0%, #061118 60%, #020609 100%)",
        color: "#e2e8f0",
        fontFamily: "'Segoe UI', Roboto, sans-serif",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Top Header */}
      <div
        style={{
          width: "100%",
          maxWidth: 620,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.25rem",
        }}
      >
        <Link
          href="/charging"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "rgba(255,255,255,0.7)",
            textDecoration: "none",
            fontSize: "0.85rem",
          }}
        >
          <ArrowLeft size={16} />
          Retour plateforme CARZONE
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", color: "#10b981" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", display: "inline-block", boxShadow: "0 0 10px #10b981" }} />
          Terminal Réseau Actif
        </div>
      </div>

      {/* Main Touchscreen Shell */}
      <div
        style={{
          width: "100%",
          maxWidth: 620,
          background: "rgba(15, 31, 46, 0.75)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(16, 185, 129, 0.25)",
          borderRadius: 24,
          padding: "2rem",
          boxShadow: "0 25px 80px rgba(0, 0, 0, 0.7), 0 0 40px rgba(16, 185, 129, 0.1)",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        {/* Terminal Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            paddingBottom: "1.25rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                boxShadow: "0 4px 15px rgba(16, 185, 129, 0.4)",
              }}
            >
              <Zap size={24} />
            </div>
            <div>
              <div style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#10b981", fontWeight: 700 }}>
                CARZONE Fast Charging
              </div>
              <h1 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 800, color: "#fff" }}>
                Borne Publique Haute Puissance
              </h1>
            </div>
          </div>

          {selectedStation && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--gold)" }}>
                {selectedStation.code}
              </div>
              <div style={{ fontSize: "0.75rem", opacity: 0.65 }}>
                {selectedStation.powerKw ? `${selectedStation.powerKw} kW DC` : "Rapide"}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div
            style={{
              padding: "0.85rem 1rem",
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: 10,
              color: "#fca5a5",
              fontSize: "0.85rem",
            }}
          >
            {error}
          </div>
        )}

        {/* STEP SUCCESS: CHARGE TERMINÉE */}
        {ussdStep === "SUCCESS" && resultData ? (
          <div
            style={{
              padding: "2rem 1.5rem",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.25rem",
            }}
          >
            <div
              style={{
                width: 70,
                height: 70,
                borderRadius: "50%",
                background: "rgba(16, 185, 129, 0.2)",
                border: "2px solid #10b981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#10b981",
              }}
            >
              <CheckCircle size={38} />
            </div>

            <div>
              <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#fff" }}>
                Paiement Validé &amp; Charge Débloquée !
              </h2>
              <div style={{ fontSize: "0.85rem", opacity: 0.7, marginTop: 4 }}>
                Facture de recharge n° <strong>{resultData.invoiceNumber}</strong>
              </div>
            </div>

            <div
              style={{
                width: "100%",
                background: "rgba(0, 0, 0, 0.3)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: 14,
                padding: "1.25rem",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                textAlign: "left",
                fontSize: "0.9rem",
              }}
            >
              <div>
                <span style={{ opacity: 0.65, fontSize: "0.8rem" }}>Énergie injectée :</span>
                <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{resultData.kwh} kWh</div>
              </div>
              <div>
                <span style={{ opacity: 0.65, fontSize: "0.8rem" }}>Tarif unitaire :</span>
                <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{resultData.pricePerKwh} FCFA/kWh</div>
              </div>
              <div>
                <span style={{ opacity: 0.65, fontSize: "0.8rem" }}>Montant Réglé :</span>
                <div style={{ fontWeight: 800, fontSize: "1.3rem", color: "#10b981" }}>
                  {formatXof(resultData.totalXof)}
                </div>
              </div>
              {resultData.savingsXof > 0 && (
                <div>
                  <span style={{ opacity: 0.65, fontSize: "0.8rem" }}>Économie Abonné :</span>
                  <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--gold)" }}>
                    {formatXof(resultData.savingsXof)}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "0.75rem", width: "100%", marginTop: 8 }}>
              <button
                type="button"
                onClick={handleReset}
                className="ox-btn"
                style={{
                  flex: 1,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  fontWeight: 700,
                  padding: "0.85rem",
                  borderRadius: 12,
                }}
              >
                <RefreshCw size={16} />
                Nouvelle Session
              </button>
            </div>
          </div>
        ) : ussdStep === "PUSH_SENT" || ussdStep === "PIN_ENTERED" ? (
          /* STEP PUSH USSD EN COURS */
          <div
            style={{
              padding: "2.5rem 1.5rem",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.25rem",
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "rgba(245, 158, 11, 0.15)",
                border: "2px solid #f59e0b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#f59e0b",
                animation: "pulse 1.5s infinite",
              }}
            >
              <Smartphone size={32} />
            </div>

            <div>
              <h2 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 800, color: "#fff" }}>
                {ussdStep === "PUSH_SENT" ? "Notification Push USSD Envoyée..." : "Validation du Code Secret..."}
              </h2>
              <p style={{ margin: "6px 0 0", fontSize: "0.88rem", opacity: 0.8 }}>
                Veuillez confirmer la transaction de <strong>{formatXof(totalXof)}</strong> sur votre téléphone portable ({phone || "+229 ..."}).
              </p>
            </div>

            <div
              style={{
                padding: "0.75rem 1.25rem",
                borderRadius: 20,
                background: "rgba(255,255,255,0.05)",
                fontSize: "0.8rem",
                color: "rgba(255,255,255,0.7)",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Clock size={14} />
              En attente de saisie du PIN {method === "MTN_MOMO" ? "MTN (*880#)" : "Moov (*855#)"}
            </div>
          </div>
        ) : (
          /* STEP CONFIGURATION DE LA RECHARGE */
          <>
            {/* Choix de la Borne & Emplacement */}
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", opacity: 0.8, marginBottom: 6 }}>
                Emplacement de la Borne :
              </label>
              <select
                className="ox-select"
                style={{ width: "100%", fontSize: "0.92rem", padding: "0.75rem 1rem", borderRadius: 10 }}
                value={stationId}
                onChange={(e) => setStationId(e.target.value)}
                disabled={loading}
              >
                {stations.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} · {s.name} {s.powerKw ? `(${s.powerKw} kW)` : ""} {s.address ? `· ${s.address}` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Identification & Badge Abonné */}
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", opacity: 0.8, marginBottom: 6 }}>
                Identification Client / Badge d&apos;Abonnement :
              </label>
              <select
                className="ox-select"
                style={{ width: "100%", fontSize: "0.92rem", padding: "0.75rem 1rem", borderRadius: 10 }}
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                disabled={loading}
              >
                <option value="">👤 Visiteur Standard (Tarif public 125 FCFA / kWh)</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.isSubscriber ? "⭐ [ABONNÉ] " : "👤 "}
                    {c.contactName} {c.companyName ? `(${c.companyName})` : ""} · {c.kwhPriceXof} FCFA/kWh
                  </option>
                ))}
              </select>

              {/* Badge Abonné highlight */}
              {selectedCustomer?.isSubscriber && (
                <div
                  style={{
                    marginTop: 8,
                    padding: "0.6rem 0.9rem",
                    borderRadius: 8,
                    background: "rgba(212, 175, 55, 0.12)",
                    border: "1px solid rgba(212, 175, 55, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "0.82rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--gold)", fontWeight: 650 }}>
                    <Sparkles size={15} />
                    <span>Abonnement Actif : {selectedCustomer.planName}</span>
                  </div>
                  <strong style={{ color: "#fff" }}>90 FCFA / kWh (-28%)</strong>
                </div>
              )}
            </div>

            {/* Choix de l'énergie (kWh) */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontSize: "0.82rem", opacity: 0.8 }}>
                  Quantité d&apos;énergie à injecter :
                </label>
                <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#10b981" }}>
                  {kwh} kWh <span style={{ opacity: 0.6, fontSize: "0.75rem", fontWeight: 400 }}>(~{Math.round(kwh * 6.5)} km)</span>
                </span>
              </div>

              {/* Presets */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 10 }}>
                {[
                  { val: 15, label: "15 kWh", desc: "~100 km" },
                  { val: 30, label: "30 kWh", desc: "~200 km" },
                  { val: 45, label: "45 kWh", desc: "~300 km" },
                  { val: 60, label: "60 kWh", desc: "Plein 100%" },
                ].map((p) => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => setKwh(p.val)}
                    style={{
                      padding: "0.65rem 0.4rem",
                      borderRadius: 10,
                      background: kwh === p.val ? "rgba(16, 185, 129, 0.25)" : "rgba(255, 255, 255, 0.05)",
                      border: kwh === p.val ? "1px solid #10b981" : "1px solid rgba(255, 255, 255, 0.1)",
                      color: kwh === p.val ? "#fff" : "rgba(255, 255, 255, 0.7)",
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{p.label}</div>
                    <div style={{ fontSize: "0.7rem", opacity: 0.6 }}>{p.desc}</div>
                  </button>
                ))}
              </div>

              <input
                type="range"
                min="5"
                max="80"
                step="1"
                value={kwh}
                onChange={(e) => setKwh(parseInt(e.target.value) || 5)}
                style={{ width: "100%", accentColor: "#10b981", cursor: "pointer" }}
              />
            </div>

            {/* Mode de Paiement */}
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", opacity: 0.8, marginBottom: 6 }}>
                Mode de Paiement Immédiat :
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setMethod("MTN_MOMO")}
                  style={{
                    padding: "0.75rem",
                    borderRadius: 10,
                    background: method === "MTN_MOMO" ? "rgba(245, 158, 11, 0.25)" : "rgba(255,255,255,0.04)",
                    border: method === "MTN_MOMO" ? "1px solid #f59e0b" : "1px solid rgba(255,255,255,0.1)",
                    color: method === "MTN_MOMO" ? "#f59e0b" : "#fff",
                    fontWeight: 650,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Smartphone size={18} />
                  <span style={{ fontSize: "0.8rem" }}>MTN MoMo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod("MOOV_MONEY")}
                  style={{
                    padding: "0.75rem",
                    borderRadius: 10,
                    background: method === "MOOV_MONEY" ? "rgba(59, 130, 246, 0.25)" : "rgba(255,255,255,0.04)",
                    border: method === "MOOV_MONEY" ? "1px solid #3b82f6" : "1px solid rgba(255,255,255,0.1)",
                    color: method === "MOOV_MONEY" ? "#60a5fa" : "#fff",
                    fontWeight: 650,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Smartphone size={18} />
                  <span style={{ fontSize: "0.8rem" }}>Moov Money</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod("CARTE")}
                  style={{
                    padding: "0.75rem",
                    borderRadius: 10,
                    background: method === "CARTE" ? "rgba(236, 72, 153, 0.25)" : "rgba(255,255,255,0.04)",
                    border: method === "CARTE" ? "1px solid #ec4899" : "1px solid rgba(255,255,255,0.1)",
                    color: method === "CARTE" ? "#f472b6" : "#fff",
                    fontWeight: 650,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <CreditCard size={18} />
                  <span style={{ fontSize: "0.8rem" }}>Carte TPE</span>
                </button>
              </div>

              {(method === "MTN_MOMO" || method === "MOOV_MONEY") && (
                <div style={{ marginTop: 10 }}>
                  <input
                    type="tel"
                    placeholder="Numéro Mobile Money (ex: 97 00 00 00)"
                    className="ox-input"
                    style={{ width: "100%", fontSize: "0.9rem" }}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Récapitulatif Tarif & Bouton de lancement */}
            <div
              style={{
                background: "rgba(0,0,0,0.35)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14,
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem" }}>
                <span style={{ opacity: 0.7 }}>Tarif par kWh appliqué :</span>
                <span style={{ fontWeight: 650 }}>{pricePerKwh} FCFA</span>
              </div>

              {savingsXof > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", color: "var(--gold)" }}>
                  <span>Avantage Membre Club :</span>
                  <span style={{ fontWeight: 700 }}>- {formatXof(savingsXof)} économisés</span>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  borderTop: "1px solid rgba(255,255,255,0.12)",
                  paddingTop: 8,
                  marginTop: 4,
                }}
              >
                <span style={{ fontWeight: 700, fontSize: "1.05rem", color: "#fff" }}>
                  Total à régler :
                </span>
                <span style={{ fontWeight: 800, fontSize: "1.5rem", color: "#10b981" }}>
                  {formatXof(totalXof)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLaunchPayment}
              disabled={loading || !stationId}
              style={{
                width: "100%",
                padding: "1rem",
                borderRadius: 14,
                border: "none",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "#fff",
                fontWeight: 750,
                fontSize: "1.1rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                boxShadow: "0 6px 20px rgba(16, 185, 129, 0.4)",
              }}
            >
              <BatteryCharging size={22} />
              {loading ? "Déclenchement en cours..." : "Payer & Débloquer la Charge"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
