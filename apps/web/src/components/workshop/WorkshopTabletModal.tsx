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
import {
  workshopCopy,
  checklistCategoryLabel,
  checklistTaskLabel,
  type WorkshopCopy,
} from "@/lib/i18n/messages/workshop";
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
        background: "var(--surface-sunken)",
        border: "1px solid var(--border)",
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
              background: "var(--accent-soft)",
              color: "var(--danger-fg)",
              border: "1px solid var(--accent)",
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
          border: "2px dashed var(--warning)",
          borderRadius: 8,
          background: "var(--surface)",
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
      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "center" }}>
        {copy.signHint}
      </span>
    </div>
  );
}

export function WorkshopTabletModal({ isOpen, onClose, entry, onSave }: WorkshopTabletProps) {
  const { locale } = usePrefs();
  const dict = workshopCopy[locale];
  const copy = dict.tablet;
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
        backgroundColor: "var(--surface)",
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
          backgroundColor: "var(--surface)",
          border: "1px solid var(--warning)",
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
            backgroundColor: "var(--surface)",
            padding: "16px 24px",
            borderBottom: "1px solid var(--border)",
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
                backgroundColor: "var(--warning-soft)",
                border: "1px solid var(--warning)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--warning-fg)",
              }}
            >
              <Wrench size={22} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h2 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0, color: "var(--text-on-accent)" }}>
                  {copy.title(entry.orNumber || "-")}
                </h2>
                <span
                  style={{
                    backgroundColor: "var(--accent-soft)",
                    color: "var(--danger-fg)",
                    fontSize: "0.82rem",
                    padding: "2px 8px",
                    borderRadius: 6,
                    border: "1px solid var(--accent)",
                    fontFamily: "monospace",
                    fontWeight: 800,
                  }}
                >
                  {entry.immatriculation}
                </span>
              </div>
              <p style={{ margin: "2px 0 0", fontSize: "0.82rem", opacity: 0.75 }}>
                {entry.brand} {entry.model} · {copy.client} <strong style={{ color: "var(--text-on-accent)" }}>{entry.clientName}</strong> · {copy.mileage} <strong style={{ color: "var(--text-on-accent)" }}>{entry.mileage ? `${entry.mileage.toLocaleString()} KM` : "-"}</strong>
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
                backgroundColor: "var(--info-soft)",
                color: "var(--info-fg)",
                fontSize: "0.8rem",
                fontWeight: 700,
                border: "1px solid var(--info)",
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
                backgroundColor: "var(--purple-soft)",
                color: "var(--purple-fg)",
                fontSize: "0.8rem",
                fontWeight: 700,
                border: "1px solid var(--purple)",
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
                backgroundColor: "var(--surface-soft)",
                border: 0,
                color: "var(--text-muted)",
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
            backgroundColor: "var(--surface)",
            padding: "8px 24px 0 24px",
            borderBottom: "1px solid var(--border)",
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
              backgroundColor: activeTab === "CHECKLIST" ? "var(--surface)" : "transparent",
              color: activeTab === "CHECKLIST" ? "var(--warning-fg)" : "var(--text-muted)",
              borderColor: activeTab === "CHECKLIST" ? "var(--warning)" : "transparent",
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
              backgroundColor: activeTab === "INTERVENTION" ? "var(--surface)" : "transparent",
              color: activeTab === "INTERVENTION" ? "var(--warning-fg)" : "var(--text-muted)",
              borderColor: activeTab === "INTERVENTION" ? "var(--warning)" : "transparent",
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
              backgroundColor: activeTab === "SIGNATURES" ? "var(--surface)" : "transparent",
              color: activeTab === "SIGNATURES" ? "var(--warning-fg)" : "var(--text-muted)",
              borderColor: activeTab === "SIGNATURES" ? "var(--warning)" : "transparent",
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
                  backgroundColor: "var(--surface-sunken)",
                  padding: "16px",
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--warning-fg)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {copy.tierTitle}
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => setAllTierTasks("EFFECTUE")}
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        backgroundColor: "var(--success-soft)",
                        color: "var(--success-fg)",
                        border: "1px solid var(--success)",
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
                        backgroundColor: "var(--danger-soft)",
                        color: "var(--danger-fg)",
                        border: "1px solid var(--danger)",
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
                          border: isSelected ? "2px solid var(--warning)" : "1px solid var(--border)",
                          background: isSelected ? "var(--warning-soft)" : "var(--surface-sunken)",
                          color: isSelected ? "var(--text-strong)" : "var(--text-muted)",
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
                  backgroundColor: "var(--surface-sunken)",
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    backgroundColor: "var(--surface)",
                    padding: "10px 16px",
                    borderBottom: "1px solid var(--border)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "0.8rem",
                    fontWeight: 800,
                    textTransform: "uppercase",
                  }}
                >
                  <span>{copy.matrixTitle(WORKSHOP_CHECKLIST_TEMPLATE.length)}</span>
                  <span style={{ color: "var(--warning-fg)" }}>{copy.activeTier(selectedTier.toLocaleString())}</span>
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
                          borderBottom: "1px solid var(--border)",
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 16,
                          backgroundColor: isPartOfTier ? (idx % 2 === 0 ? "var(--surface-soft)" : "transparent") : "var(--surface-soft)",
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
                                backgroundColor: "var(--warning-soft)",
                                color: "var(--warning-fg)",
                              }}
                            >
                              {task.mileageTier.toLocaleString()} KM
                            </span>
                            {task.category && (
                              <span style={{ fontSize: "0.72rem", opacity: 0.65, textTransform: "uppercase" }}>
                                [{checklistCategoryLabel(dict, task.category)}]
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: "0.9rem", fontWeight: 650, color: "var(--text-on-accent)" }}>
                            {checklistTaskLabel(dict, task.taskLabel)}
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
                              backgroundColor: "var(--surface-sunken)",
                              border: "1px solid var(--border)",
                              borderRadius: 6,
                              padding: "6px 10px",
                              color: "var(--text-on-accent)",
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
                              backgroundColor: state.status === "EFFECTUE" ? "var(--success-solid)" : "var(--surface-soft)",
                              color: state.status === "EFFECTUE" ? "var(--text-on-accent)" : "var(--text-muted)",
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
                              backgroundColor: state.status === "NON_EFFECTUE" ? "var(--danger-solid)" : "var(--surface-soft)",
                              color: state.status === "NON_EFFECTUE" ? "var(--text-on-accent)" : "var(--text-muted)",
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
                              backgroundColor: state.status === "NON_APPLICABLE" ? "var(--surface-sunken)" : "var(--surface-soft)",
                              color: state.status === "NON_APPLICABLE" ? "var(--text-on-accent)" : "var(--text-subtle)",
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
                  backgroundColor: "var(--surface-sunken)",
                  padding: "16px",
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                }}
              >
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 800, color: "var(--warning-fg)", textTransform: "uppercase", marginBottom: 6 }}>
                  {copy.faultLabel}
                </label>
                <textarea
                  rows={2}
                  value={reportedFault}
                  onChange={(e) => setReportedFault(e.target.value)}
                  placeholder={copy.faultPlaceholder}
                  style={{
                    width: "100%",
                    backgroundColor: "var(--surface-sunken)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "10px",
                    fontSize: "0.85rem",
                    color: "var(--text-on-accent)",
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
                    <span style={{ color: "var(--warning-fg)", fontSize: "0.72rem" }}>{copy.pole1Tag}</span>
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
                    <span style={{ color: "var(--warning-fg)", fontSize: "0.72rem" }}>{copy.pole2Tag}</span>
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
                    <span style={{ color: "var(--warning-fg)", fontSize: "0.72rem" }}>{copy.pole3Tag}</span>
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
                    <span style={{ color: "var(--warning-fg)", fontSize: "0.72rem" }}>{copy.pole4Tag}</span>
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
                  <label style={{ ...poleLabelStyle, color: "var(--success-fg)" }}>
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
                  <label style={{ ...poleLabelStyle, color: "var(--warning-fg)" }}>
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
                  backgroundColor: "var(--surface-sunken)",
                  padding: "16px",
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 12,
                }}
              >
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: 4 }}>
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
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: 4 }}>
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
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: 4 }}>
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
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: 4 }}>
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
                  backgroundColor: "var(--warning-soft)",
                  border: "1px solid var(--warning)",
                  borderRadius: 12,
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  color: "var(--warning-fg)",
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
            backgroundColor: "var(--surface)",
            padding: "16px 24px",
            borderTop: "1px solid var(--border)",
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
              backgroundColor: "var(--surface-soft)",
              color: "var(--text-muted)",
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
              background: "var(--warning-solid)",
              color: "var(--text-strong)",
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
  backgroundColor: "var(--surface-sunken)",
  padding: "14px",
  borderRadius: 12,
  border: "1px solid var(--border)",
};

const poleLabelStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: "0.8rem",
  fontWeight: 750,
  color: "var(--text-on-accent)",
  marginBottom: 8,
};

const poleTextareaStyle: React.CSSProperties = {
  width: "100%",
  backgroundColor: "var(--surface-sunken)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: "8px 10px",
  fontSize: "0.82rem",
  color: "var(--text-on-accent)",
  outline: "none",
  boxSizing: "border-box",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  backgroundColor: "var(--surface-sunken)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: "8px 10px",
  fontSize: "0.82rem",
  color: "var(--text-on-accent)",
  outline: "none",
  boxSizing: "border-box",
};
