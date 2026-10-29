"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  CheckCircle2,
  XCircle,
  Wrench,
  PenTool,
  Printer,
  Save,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { WORKSHOP_CHECKLIST_TEMPLATE } from "@/lib/workshop-checklist-data";
import { usePrefs } from "@/components/PrefsProvider";
import { workshopCopy, type WorkshopCopy } from "@/lib/i18n/messages/workshop";
import type { WorkshopSignaturePayload, WorkshopTabletPayload } from "@/lib/workshop-types";

export type WorkshopTabletProps = {
  isOpen: boolean;
  onClose: () => void;
  entry: {
    id: string;
    orNumber?: string | null;
    brand?: string | null;
    model?: string | null;
    immatriculation: string;
    chassis?: string | null;
    mileage?: number | null;
    clientName: string;
    phone?: string | null;
    entryDate?: string | null;
    reportedFault?: string | null;
    maintenanceTier?: number | null;
    oilType?: string | null;
    faultMotorTransmission?: string | null;
    faultSuspension?: string | null;
    faultElectricity?: string | null;
    faultOthers?: string | null;
    worksDone?: string | null;
    partsToOrder?: string | null;
    observations?: string | null;
    startTime?: string | null;
    endTime?: string | null;
    technicianName?: string | null;
    workshopManagerName?: string | null;
    checklistItems?: Array<{
      id?: string;
      mileageTier: number;
      taskLabel: string;
      status: string;
      observation?: string | null;
    }>;
    signatures?: Array<{
      signerRole: string;
      signerName: string;
      signatureData: string;
    }>;
  };
  onSave: (payload: WorkshopTabletPayload) => Promise<{ success: boolean; error?: string }>;
};

// Composant Canvas pour signature tactile autonome
function SignaturePad({
  title,
  signerRole,
  initialData,
  copy,
  onSaveSignature,
}: {
  title: string;
  signerRole: "CLIENT" | "TECHNICIEN" | "RESPONSABLE_ATELIER";
  initialData?: string;
  copy: WorkshopCopy["tablet"];
  onSaveSignature: (role: string, dataUrl: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastDataUrlRef = useRef<string>(initialData || "");
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(!!initialData);

  const redrawFromDataUrl = (dataUrl: string) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    if (!dataUrl) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    const img = new window.Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = dataUrl;
  };

  // Redimensionne le buffer selon la taille affichée x devicePixelRatio,
  // sinon le tracé est flou/décalé sur tablette (buffer fixe != taille CSS réelle).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeBuffer = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0) return;
      const dpr = window.devicePixelRatio || 1;
      const nextWidth = Math.round(rect.width * dpr);
      const nextHeight = Math.round(140 * dpr);
      if (canvas.width === nextWidth && canvas.height === nextHeight) return;

      canvas.width = nextWidth;
      canvas.height = nextHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 2.5 * (canvas.width / rect.width);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }

      // Le redimensionnement du buffer efface le tracé : on le redessine.
      redrawFromDataUrl(lastDataUrlRef.current);
    };

    resizeBuffer();

    const observer = new ResizeObserver(() => resizeBuffer());
    observer.observe(canvas);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const next = initialData || "";
    setHasDrawn(!!initialData);
    if (next === lastDataUrlRef.current) return; // redraw déjà fait par le resize
    lastDataUrlRef.current = next;
    redrawFromDataUrl(next);
  }, [initialData]);

  const getScaledPoint = (
    canvas: HTMLCanvasElement,
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);
    const { x, y } = getScaledPoint(canvas, e);

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getScaledPoint(canvas, e);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL("image/png");
      lastDataUrlRef.current = dataUrl;
      onSaveSignature(signerRole, dataUrl);
    }
  };

  const clearSignature = () => {
    if (hasDrawn && !window.confirm(copy.clearConfirm)) {
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    lastDataUrlRef.current = "";
    setHasDrawn(false);
    onSaveSignature(signerRole, "");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        background: "rgba(15, 23, 42, 0.6)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: 12,
        padding: 14,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--ice-text)" }}>{title}</span>
        {hasDrawn && (
          <button
            type="button"
            onClick={clearSignature}
            style={{
              fontSize: "0.72rem",
              background: "rgba(225, 29, 72, 0.15)",
              color: "#fb7185",
              border: "1px solid rgba(225, 29, 72, 0.3)",
              padding: "2px 8px",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            {copy.clearSignature}
          </button>
        )}
      </div>

      <div
        style={{
          border: "2px dashed rgba(245, 158, 11, 0.4)",
          borderRadius: 8,
          background: "#ffffff",
          overflow: "hidden",
          touchAction: "none",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: 140, display: "block", cursor: "crosshair" }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <span style={{ fontSize: "0.72rem", color: "#94a3b8", textAlign: "center" }}>
        {copy.signHint}
      </span>
    </div>
  );
}

export function WorkshopTabletModal({ isOpen, onClose, entry, onSave }: WorkshopTabletProps) {
  const { locale } = usePrefs();
  const copy = workshopCopy[locale].tablet;
  const [activeTab, setActiveTab] = useState<"CHECKLIST" | "INTERVENTION" | "SIGNATURES">("CHECKLIST");
  const [selectedTier, setSelectedTier] = useState<number>(entry.maintenanceTier || 5000);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // États locaux
  const [reportedFault, setReportedFault] = useState(entry.reportedFault || "");
  const [faultMotorTransmission, setFaultMotorTransmission] = useState(entry.faultMotorTransmission || "");
  const [faultSuspension, setFaultSuspension] = useState(entry.faultSuspension || "");
  const [faultElectricity, setFaultElectricity] = useState(entry.faultElectricity || "");
  const [faultOthers, setFaultOthers] = useState(entry.faultOthers || "");
  const [worksDone, setWorksDone] = useState(entry.worksDone || "");
  const [partsToOrder, setPartsToOrder] = useState(entry.partsToOrder || "");
  const [observations, setObservations] = useState(entry.observations || "");
  const [startTime, setStartTime] = useState(entry.startTime || "");
  const [endTime, setEndTime] = useState(entry.endTime || "");
  const [technicianName, setTechnicianName] = useState(entry.technicianName || "");
  const [workshopManagerName, setWorkshopManagerName] = useState(entry.workshopManagerName || "");

  // États checklist
  const [taskStates, setTaskStates] = useState<Record<string, { status: string; observation: string }>>({});

  // Initialisation checklist
  useEffect(() => {
    const map: Record<string, { status: string; observation: string }> = {};
    WORKSHOP_CHECKLIST_TEMPLATE.forEach((task) => {
      const existing = entry.checklistItems?.find((i) => i.taskLabel === task.taskLabel);
      if (existing) {
        map[task.taskLabel] = {
          status: existing.status,
          observation: existing.observation || "",
        };
      } else {
        const isSelectedTierTask = (entry.maintenanceTier || 5000) >= task.mileageTier;
        map[task.taskLabel] = {
          status: isSelectedTierTask ? "EFFECTUE" : "NON_EFFECTUE",
          observation: "",
        };
      }
    });
    setTaskStates(map);
  }, [entry]);

  // Signatures
  const [signatures, setSignatures] = useState<Record<string, string>>({});
  useEffect(() => {
    const sigMap: Record<string, string> = {};
    entry.signatures?.forEach((s) => {
      sigMap[s.signerRole] = s.signatureData;
    });
    setSignatures(sigMap);
  }, [entry]);

  const handleSignatureSave = (role: string, dataUrl: string) => {
    setSignatures((prev) => ({ ...prev, [role]: dataUrl }));
  };

  const handleTaskStatusChange = (taskLabel: string, status: string) => {
    setTaskStates((prev) => ({
      ...prev,
      [taskLabel]: { ...prev[taskLabel], status },
    }));
  };

  const handleTaskObsChange = (taskLabel: string, observation: string) => {
    setTaskStates((prev) => ({
      ...prev,
      [taskLabel]: { ...prev[taskLabel], observation },
    }));
  };

  const setAllTierTasks = (status: "EFFECTUE" | "NON_EFFECTUE") => {
    const updated: Record<string, { status: string; observation: string }> = { ...taskStates };
    WORKSHOP_CHECKLIST_TEMPLATE.forEach((task) => {
      if (selectedTier >= task.mileageTier) {
        updated[task.taskLabel] = {
          ...updated[task.taskLabel],
          status,
        };
      }
    });
    setTaskStates(updated);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const checklistPayload = WORKSHOP_CHECKLIST_TEMPLATE.map((task) => {
        const state = taskStates[task.taskLabel] || { status: "NON_EFFECTUE", observation: "" };
        return {
          mileageTier: task.mileageTier,
          taskLabel: task.taskLabel,
          category: task.category,
          status: state.status,
          observation: state.observation || null,
        };
      });

      const signaturePayload = [
        signatures["CLIENT"]
          ? { signerRole: "CLIENT", signerName: entry.clientName, signatureData: signatures["CLIENT"] }
          : null,
        signatures["TECHNICIEN"]
          ? { signerRole: "TECHNICIEN", signerName: technicianName || "Technicien", signatureData: signatures["TECHNICIEN"] }
          : null,
        signatures["RESPONSABLE_ATELIER"]
          ? {
              signerRole: "RESPONSABLE_ATELIER",
              signerName: workshopManagerName || "Chef Atelier",
              signatureData: signatures["RESPONSABLE_ATELIER"],
            }
          : null,
      ].filter((signature): signature is WorkshopSignaturePayload => signature !== null);

      const result = await onSave({
        id: entry.id,
        maintenanceTier: selectedTier,
        reportedFault,
        faultMotorTransmission,
        faultSuspension,
        faultElectricity,
        faultOthers,
        worksDone,
        partsToOrder,
        observations,
        startTime,
        endTime,
        technicianName,
        workshopManagerName,
        checklistItems: checklistPayload,
        signatures: signaturePayload,
      });

      if (!result.success) {
        alert(result.error || copy.saveError);
        return;
      }

      onClose();
    } catch (err) {
      console.error("Erreur sauvegarde tablette atelier :", err);
      alert(err instanceof Error ? err.message : copy.saveError);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const TIERS = [5000, 10000, 30000, 50000, 100000];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "rgba(5, 10, 20, 0.85)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          backgroundColor: "#0d1624",
          border: "1px solid rgba(245, 158, 11, 0.35)",
          width: "100%",
          maxWidth: "1020px",
          borderRadius: "16px",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.7)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "92vh",
          overflow: "hidden",
          color: "var(--ice-text)",
        }}
      >
        {/* EN-TÊTE MODAL TABLETTE */}
        <div
          style={{
            backgroundColor: "#111c2e",
            padding: "16px 24px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: "rgba(245, 158, 11, 0.15)",
                border: "1px solid rgba(245, 158, 11, 0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fbbf24",
              }}
            >
              <Wrench size={22} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h2 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0, color: "#ffffff" }}>
                  {copy.title(entry.orNumber || "-")}
                </h2>
                <span
                  style={{
                    backgroundColor: "rgba(225, 29, 72, 0.2)",
                    color: "#fb7185",
                    fontSize: "0.82rem",
                    padding: "2px 8px",
                    borderRadius: 6,
                    border: "1px solid rgba(225, 29, 72, 0.35)",
                    fontFamily: "monospace",
                    fontWeight: 800,
                  }}
                >
                  {entry.immatriculation}
                </span>
              </div>
              <p style={{ margin: "2px 0 0", fontSize: "0.82rem", opacity: 0.75 }}>
                {entry.brand} {entry.model} · {copy.client} <strong style={{ color: "#ffffff" }}>{entry.clientName}</strong> · {copy.mileage} <strong style={{ color: "#ffffff" }}>{entry.mileage ? `${entry.mileage.toLocaleString()} KM` : "-"}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <a
              href={`/workshop/${entry.id}/fiche-intervention`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 8,
                backgroundColor: "rgba(56, 189, 248, 0.15)",
                color: "#7dd3fc",
                fontSize: "0.8rem",
                fontWeight: 700,
                border: "1px solid rgba(56, 189, 248, 0.3)",
                textDecoration: "none",
              }}
              title={copy.fiche1Title}
            >
              <Printer size={14} /> {copy.fiche1}
            </a>
            <a
              href={`/workshop/${entry.id}/fiche-entretien`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 8,
                backgroundColor: "rgba(168, 85, 247, 0.15)",
                color: "#d8b4fe",
                fontSize: "0.8rem",
                fontWeight: 700,
                border: "1px solid rgba(168, 85, 247, 0.3)",
                textDecoration: "none",
              }}
              title={copy.fiche2Title}
            >
              <Printer size={14} /> {copy.fiche2}
            </a>
            <button
              type="button"
              onClick={onClose}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                border: 0,
                color: "#94a3b8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 3 ONGLETS TACTILES */}
        <div
          style={{
            backgroundColor: "#0a121d",
            padding: "8px 24px 0 24px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("CHECKLIST")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: "10px 10px 0 0",
              fontSize: "0.85rem",
              fontWeight: 750,
              cursor: "pointer",
              border: "1px solid transparent",
              borderBottom: 0,
              backgroundColor: activeTab === "CHECKLIST" ? "#0d1624" : "transparent",
              color: activeTab === "CHECKLIST" ? "#fbbf24" : "#94a3b8",
              borderColor: activeTab === "CHECKLIST" ? "rgba(245, 158, 11, 0.4)" : "transparent",
            }}
          >
            <CheckCircle2 size={16} />
            {copy.tabChecklist(selectedTier.toLocaleString())}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("INTERVENTION")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: "10px 10px 0 0",
              fontSize: "0.85rem",
              fontWeight: 750,
              cursor: "pointer",
              border: "1px solid transparent",
              borderBottom: 0,
              backgroundColor: activeTab === "INTERVENTION" ? "#0d1624" : "transparent",
              color: activeTab === "INTERVENTION" ? "#fbbf24" : "#94a3b8",
              borderColor: activeTab === "INTERVENTION" ? "rgba(245, 158, 11, 0.4)" : "transparent",
            }}
          >
            <Wrench size={16} />
            {copy.tabIntervention}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("SIGNATURES")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: "10px 10px 0 0",
              fontSize: "0.85rem",
              fontWeight: 750,
              cursor: "pointer",
              border: "1px solid transparent",
              borderBottom: 0,
              backgroundColor: activeTab === "SIGNATURES" ? "#0d1624" : "transparent",
              color: activeTab === "SIGNATURES" ? "#fbbf24" : "#94a3b8",
              borderColor: activeTab === "SIGNATURES" ? "rgba(245, 158, 11, 0.4)" : "transparent",
            }}
          >
            <PenTool size={16} />
            {copy.tabSignatures}
          </button>
        </div>

        {/* CORPS DE L'ONGLET */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
          {/* ONGLET 1 : CHECKLIST PALIERS */}
          {activeTab === "CHECKLIST" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* SÉLECTEUR DE PALIER */}
              <div
                style={{
                  backgroundColor: "rgba(15, 23, 42, 0.7)",
                  padding: "16px",
                  borderRadius: 12,
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#fbbf24", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {copy.tierTitle}
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => setAllTierTasks("EFFECTUE")}
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        backgroundColor: "rgba(16, 185, 129, 0.15)",
                        color: "#34d399",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        padding: "6px 12px",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      {copy.checkAll}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAllTierTasks("NON_EFFECTUE")}
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        backgroundColor: "rgba(244, 63, 94, 0.15)",
                        color: "#fb7185",
                        border: "1px solid rgba(244, 63, 94, 0.3)",
                        padding: "6px 12px",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      {copy.reset}
                    </button>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8 }}>
                  {TIERS.map((tier) => {
                    const isSelected = selectedTier === tier;
                    return (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setSelectedTier(tier)}
                        style={{
                          padding: "10px",
                          borderRadius: 10,
                          border: isSelected ? "2px solid #fbbf24" : "1px solid rgba(255, 255, 255, 0.1)",
                          background: isSelected ? "linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(217, 119, 6, 0.4))" : "rgba(15, 23, 42, 0.5)",
                          color: isSelected ? "#ffffff" : "#94a3b8",
                          fontWeight: 750,
                          cursor: "pointer",
                          textAlign: "center",
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}
                      >
                        <span style={{ fontSize: "0.95rem" }}>{tier.toLocaleString()} KM</span>
                        <span style={{ fontSize: "0.72rem", opacity: 0.8, textTransform: "uppercase" }}>
                          {tier === 5000 ? copy.tierStandard : tier === 10000 ? copy.tierFilters : copy.tierMajor}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* LISTE DES 22 TÂCHES */}
              <div
                style={{
                  backgroundColor: "rgba(15, 23, 42, 0.7)",
                  borderRadius: 12,
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#111c2e",
                    padding: "10px 16px",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "0.8rem",
                    fontWeight: 800,
                    textTransform: "uppercase",
                  }}
                >
                  <span>{copy.matrixTitle(WORKSHOP_CHECKLIST_TEMPLATE.length)}</span>
                  <span style={{ color: "#fbbf24" }}>{copy.activeTier(selectedTier.toLocaleString())}</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  {WORKSHOP_CHECKLIST_TEMPLATE.map((task, idx) => {
                    const state = taskStates[task.taskLabel] || { status: "NON_EFFECTUE", observation: "" };
                    const isPartOfTier = selectedTier >= task.mileageTier;

                    return (
                      <div
                        key={task.id}
                        style={{
                          padding: "12px 16px",
                          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 16,
                          backgroundColor: isPartOfTier ? (idx % 2 === 0 ? "rgba(255, 255, 255, 0.02)" : "transparent") : "rgba(0, 0, 0, 0.2)",
                          opacity: isPartOfTier ? 1 : 0.65,
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <span
                              style={{
                                fontSize: "0.72rem",
                                fontWeight: 800,
                                padding: "2px 6px",
                                borderRadius: 4,
                                backgroundColor: "rgba(245, 158, 11, 0.15)",
                                color: "#fbbf24",
                              }}
                            >
                              {task.mileageTier.toLocaleString()} KM
                            </span>
                            {task.category && (
                              <span style={{ fontSize: "0.72rem", opacity: 0.65, textTransform: "uppercase" }}>
                                [{task.category}]
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: "0.9rem", fontWeight: 650, color: "#ffffff" }}>
                            {task.taskLabel}
                          </div>
                          <input
                            type="text"
                            placeholder={copy.observationPlaceholder}
                            value={state.observation}
                            onChange={(e) => handleTaskObsChange(task.taskLabel, e.target.value)}
                            style={{
                              marginTop: 6,
                              width: "100%",
                              maxWidth: 500,
                              fontSize: "0.8rem",
                              backgroundColor: "rgba(0, 0, 0, 0.4)",
                              border: "1px solid rgba(255, 255, 255, 0.12)",
                              borderRadius: 6,
                              padding: "6px 10px",
                              color: "#ffffff",
                              outline: "none",
                            }}
                          />
                        </div>

                        {/* TOUCH BUTTONS : EFFECTUE / NON EFFECTUE / NA */}
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => handleTaskStatusChange(task.taskLabel, "EFFECTUE")}
                            style={{
                              padding: "8px 12px",
                              borderRadius: 8,
                              fontSize: "0.78rem",
                              fontWeight: 800,
                              cursor: "pointer",
                              border: 0,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              backgroundColor: state.status === "EFFECTUE" ? "#16a34a" : "rgba(255, 255, 255, 0.08)",
                              color: state.status === "EFFECTUE" ? "#ffffff" : "#94a3b8",
                            }}
                          >
                            <CheckCircle2 size={14} /> {copy.done}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleTaskStatusChange(task.taskLabel, "NON_EFFECTUE")}
                            style={{
                              padding: "8px 12px",
                              borderRadius: 8,
                              fontSize: "0.78rem",
                              fontWeight: 800,
                              cursor: "pointer",
                              border: 0,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              backgroundColor: state.status === "NON_EFFECTUE" ? "#dc2626" : "rgba(255, 255, 255, 0.08)",
                              color: state.status === "NON_EFFECTUE" ? "#ffffff" : "#94a3b8",
                            }}
                          >
                            <XCircle size={14} /> {copy.notDone}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleTaskStatusChange(task.taskLabel, "NON_APPLICABLE")}
                            style={{
                              padding: "8px 10px",
                              borderRadius: 8,
                              fontSize: "0.75rem",
                              cursor: "pointer",
                              border: 0,
                              backgroundColor: state.status === "NON_APPLICABLE" ? "#475569" : "rgba(255, 255, 255, 0.05)",
                              color: state.status === "NON_APPLICABLE" ? "#ffffff" : "#64748b",
                            }}
                          >
                            {copy.notApplicable}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ONGLET 2 : FICHE INTERVENTION (4 PÔLES) */}
          {activeTab === "INTERVENTION" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* PANNE SIGNALÉE */}
              <div
                style={{
                  backgroundColor: "rgba(15, 23, 42, 0.7)",
                  padding: "16px",
                  borderRadius: 12,
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 800, color: "#fbbf24", textTransform: "uppercase", marginBottom: 6 }}>
                  {copy.faultLabel}
                </label>
                <textarea
                  rows={2}
                  value={reportedFault}
                  onChange={(e) => setReportedFault(e.target.value)}
                  placeholder={copy.faultPlaceholder}
                  style={{
                    width: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: 8,
                    padding: "10px",
                    fontSize: "0.85rem",
                    color: "#ffffff",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* LES 4 PÔLES TECHNIQUES */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={poleBoxStyle}>
                  <label style={poleLabelStyle}>
                    <span>{copy.pole1Title}</span>
                    <span style={{ color: "#fbbf24", fontSize: "0.72rem" }}>{copy.pole1Tag}</span>
                  </label>
                  <textarea
                    rows={2}
                    value={faultMotorTransmission}
                    onChange={(e) => setFaultMotorTransmission(e.target.value)}
                    placeholder={copy.pole1Placeholder}
                    style={poleTextareaStyle}
                  />
                </div>

                <div style={poleBoxStyle}>
                  <label style={poleLabelStyle}>
                    <span>{copy.pole2Title}</span>
                    <span style={{ color: "#fbbf24", fontSize: "0.72rem" }}>{copy.pole2Tag}</span>
                  </label>
                  <textarea
                    rows={2}
                    value={faultSuspension}
                    onChange={(e) => setFaultSuspension(e.target.value)}
                    placeholder={copy.pole2Placeholder}
                    style={poleTextareaStyle}
                  />
                </div>

                <div style={poleBoxStyle}>
                  <label style={poleLabelStyle}>
                    <span>{copy.pole3Title}</span>
                    <span style={{ color: "#fbbf24", fontSize: "0.72rem" }}>{copy.pole3Tag}</span>
                  </label>
                  <textarea
                    rows={2}
                    value={faultElectricity}
                    onChange={(e) => setFaultElectricity(e.target.value)}
                    placeholder={copy.pole3Placeholder}
                    style={poleTextareaStyle}
                  />
                </div>

                <div style={poleBoxStyle}>
                  <label style={poleLabelStyle}>
                    <span>{copy.pole4Title}</span>
                    <span style={{ color: "#fbbf24", fontSize: "0.72rem" }}>{copy.pole4Tag}</span>
                  </label>
                  <textarea
                    rows={2}
                    value={faultOthers}
                    onChange={(e) => setFaultOthers(e.target.value)}
                    placeholder={copy.pole4Placeholder}
                    style={poleTextareaStyle}
                  />
                </div>
              </div>

              {/* TRAVAUX EFFECTUÉS & PIÈCES */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={poleBoxStyle}>
                  <label style={{ ...poleLabelStyle, color: "#34d399" }}>
                    {copy.worksLabel}
                  </label>
                  <textarea
                    rows={3}
                    value={worksDone}
                    onChange={(e) => setWorksDone(e.target.value)}
                    placeholder={copy.worksPlaceholder}
                    style={poleTextareaStyle}
                  />
                </div>

                <div style={poleBoxStyle}>
                  <label style={{ ...poleLabelStyle, color: "#fbbf24" }}>
                    {copy.partsLabel}
                  </label>
                  <textarea
                    rows={3}
                    value={partsToOrder}
                    onChange={(e) => setPartsToOrder(e.target.value)}
                    placeholder={copy.partsPlaceholder}
                    style={poleTextareaStyle}
                  />
                </div>
              </div>

              {/* HORODATAGE & TECHNICIEN */}
              <div
                style={{
                  backgroundColor: "rgba(15, 23, 42, 0.7)",
                  padding: "16px",
                  borderRadius: 12,
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 12,
                }}
              >
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", marginBottom: 4 }}>
                    {copy.startLabel}
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", marginBottom: 4 }}>
                    {copy.endLabel}
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", marginBottom: 4 }}>
                    {copy.technicianLabel}
                  </label>
                  <input
                    type="text"
                    value={technicianName}
                    onChange={(e) => setTechnicianName(e.target.value)}
                    placeholder={copy.technicianPlaceholder}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", marginBottom: 4 }}>
                    {copy.managerLabel}
                  </label>
                  <input
                    type="text"
                    value={workshopManagerName}
                    onChange={(e) => setWorkshopManagerName(e.target.value)}
                    placeholder={copy.managerPlaceholder}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ONGLET 3 : SIGNATURES TACTILES */}
          {activeTab === "SIGNATURES" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  backgroundColor: "rgba(245, 158, 11, 0.12)",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  borderRadius: 12,
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  color: "#fbbf24",
                  fontSize: "0.82rem",
                }}
              >
                <AlertCircle size={20} style={{ flexShrink: 0 }} />
                <p style={{ margin: 0 }}>
                  {copy.signatureNote}
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
                <SignaturePad
                  title={copy.padClient}
                  signerRole="CLIENT"
                  copy={copy}
                  initialData={signatures["CLIENT"]}
                  onSaveSignature={handleSignatureSave}
                />
                <SignaturePad
                  title={copy.padTechnician}
                  signerRole="TECHNICIEN"
                  copy={copy}
                  initialData={signatures["TECHNICIEN"]}
                  onSaveSignature={handleSignatureSave}
                />
                <SignaturePad
                  title={copy.padManager}
                  signerRole="RESPONSABLE_ATELIER"
                  copy={copy}
                  initialData={signatures["RESPONSABLE_ATELIER"]}
                  onSaveSignature={handleSignatureSave}
                />
              </div>
            </div>
          )}
        </div>

        {/* PIED DE MODAL & BOUTONS D'ACTION */}
        <div
          style={{
            backgroundColor: "#111c2e",
            padding: "16px 24px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "10px 18px",
              borderRadius: 8,
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              color: "#94a3b8",
              fontSize: "0.85rem",
              fontWeight: 650,
              border: 0,
              cursor: "pointer",
            }}
          >
            {copy.closeNoSave}
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              color: "#111827",
              border: 0,
              padding: "10px 24px",
              borderRadius: 10,
              fontWeight: 800,
              fontSize: "0.875rem",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              boxShadow: "0 2px 12px rgba(245, 158, 11, 0.4)",
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            <Save size={16} />
            {isSubmitting ? copy.saveRunning : copy.save}
          </button>
        </div>
      </div>
    </div>
  );
}

const poleBoxStyle: React.CSSProperties = {
  backgroundColor: "rgba(15, 23, 42, 0.7)",
  padding: "14px",
  borderRadius: 12,
  border: "1px solid rgba(255, 255, 255, 0.1)",
};

const poleLabelStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: "0.8rem",
  fontWeight: 750,
  color: "#ffffff",
  marginBottom: 8,
};

const poleTextareaStyle: React.CSSProperties = {
  width: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  borderRadius: 8,
  padding: "8px 10px",
  fontSize: "0.82rem",
  color: "#ffffff",
  outline: "none",
  boxSizing: "border-box",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  borderRadius: 8,
  padding: "8px 10px",
  fontSize: "0.82rem",
  color: "#ffffff",
  outline: "none",
  boxSizing: "border-box",
};
