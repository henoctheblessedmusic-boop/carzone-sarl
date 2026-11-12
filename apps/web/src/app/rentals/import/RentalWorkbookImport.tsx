"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { AlertCircle, CheckCircle2, FileSpreadsheet, Loader2, Upload } from "lucide-react";
import {
  parseRentalWorkbook,
  summarizeRentalWorkbook,
  type RentalWorkbookPreview,
} from "@/lib/rental-workbook";
import { importRentalWorkbook, type RentalWorkbookImportResult } from "./actions";

export function RentalWorkbookImport() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState<RentalWorkbookPreview | null>(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState<RentalWorkbookImportResult | null>(null);
  const [createHistoricalPayments, setCreateHistoricalPayments] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function readFile(file: File | undefined) {
    if (!file) return;
    setError("");
    setResult(null);
    setFileName(file.name);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      if (!sheet) throw new Error("Aucune feuille exploitable.");
      const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "", raw: false });
      const parsed = parseRentalWorkbook(matrix);
      if (parsed.contracts.length === 0) throw new Error("Aucun contrat de location reconnu dans ce fichier.");
      setPreview(parsed);
    } catch (err) {
      setPreview(null);
      setError(err instanceof Error ? err.message : "Impossible de lire le fichier.");
    }
  }

  function submit() {
    if (!preview) return;
    setError("");
    startTransition(async () => {
      try {
        setResult(await importRentalWorkbook({
          clients: preview.clients,
          vehicles: preview.vehicles,
          contracts: preview.contracts,
          createHistoricalPayments,
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "L'import a échoué.");
      }
    });
  }

  const summary = preview ? summarizeRentalWorkbook(preview) : null;

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <div className="ox-glass" style={{ padding: "1rem 1.2rem", display: "grid", gap: 10 }}>
        <div>
          <strong>Importer la base clients et location</strong>
          <div style={{ fontSize: "0.82rem", opacity: 0.72, marginTop: 2 }}>
            Le fichier contient les clients, le parc locatif et les contrats historiques. L&apos;import est préparé puis confirmé avant écriture.
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          style={{ display: "none" }}
          onChange={(event) => void readFile(event.target.files?.[0])}
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <button type="button" className="ox-btn ox-btn-primary" onClick={() => inputRef.current?.click()}>
            <Upload size={16} /> Choisir le fichier Excel
          </button>
          {fileName ? <span style={{ fontSize: "0.82rem", opacity: 0.7 }}>{fileName}</span> : null}
        </div>
      </div>

      {error ? (
        <div role="alert" style={{ padding: "10px 12px", borderRadius: 10, background: "var(--danger-soft)", color: "var(--danger-fg)", fontSize: "0.85rem" }}>
          <AlertCircle size={15} style={{ verticalAlign: "middle", marginRight: 6 }} /> {error}
        </div>
      ) : null}

      {summary && preview ? (
        <div className="ox-glass" style={{ padding: "1rem 1.2rem", display: "grid", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <strong>Aperçu avant import</strong>
            <span style={{ fontSize: "0.78rem", opacity: 0.65 }}>Aucune écriture en base n&apos;est encore faite.</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 8 }}>
            <Metric label="Clients" value={summary.clients} />
            <Metric label="Véhicules" value={summary.vehicles} />
            <Metric label="Contrats" value={summary.contracts} />
            <Metric label="Brouillons" value={summary.drafts} />
            <Metric label="Actifs" value={summary.actives} />
            <Metric label="Créances" value={summary.unpaid} />
          </div>
          <div style={{ fontSize: "0.8rem", opacity: 0.75 }}>
            Chauffeur : {summary.withDriver} avec · {summary.withoutDriver} sans · {summary.unknownDriver} non renseigné.
            {" "}Lignes ignorées : {summary.ignoredRows}.
          </div>
          {summary.warnings > 0 ? (
            <details>
              <summary style={{ cursor: "pointer", fontSize: "0.82rem", color: "var(--warning-fg)" }}>
                {summary.warnings} avertissement(s) à vérifier
              </summary>
              <ul style={{ margin: "8px 0 0", paddingLeft: 18, maxHeight: 220, overflow: "auto", fontSize: "0.76rem", lineHeight: 1.45 }}>
                {preview.warnings.slice(0, 100).map((warning) => <li key={warning}>{warning}</li>)}
              </ul>
            </details>
          ) : null}
          <label style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: "0.82rem" }}>
            <input type="checkbox" checked={createHistoricalPayments} onChange={(event) => setCreateHistoricalPayments(event.target.checked)} />
            Créer les encaissements historiques pour les contrats payés
          </label>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Link href="/rentals/fleet" className="ox-btn ox-btn-ghost">Annuler</Link>
            <button type="button" className="ox-btn ox-btn-primary" onClick={submit} disabled={isPending}>
              {isPending ? <Loader2 size={16} className="ox-spin" /> : <FileSpreadsheet size={16} />}
              {isPending ? "Import en cours..." : "Confirmer l'import"}
            </button>
          </div>
        </div>
      ) : null}

      {result ? (
        <div className="ox-glass" style={{ padding: "1rem 1.2rem", display: "grid", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--success-fg)", fontWeight: 700 }}>
            <CheckCircle2 size={18} /> Import terminé
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 8 }}>
            <Metric label="Clients créés" value={result.clientsCreated} />
            <Metric label="Clients rapprochés" value={result.clientsMatched} />
            <Metric label="Véhicules créés" value={result.vehiclesCreated} />
            <Metric label="Contrats créés" value={result.contractsCreated} />
            <Metric label="Contrats ignorés" value={result.contractsSkipped} />
            <Metric label="Paiements créés" value={result.paymentsCreated} />
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link href="/rentals/fleet" className="ox-btn ox-btn-ghost">Voir le parc locatif</Link>
            <Link href="/rentals/contracts" className="ox-btn ox-btn-ghost">Voir les contrats</Link>
            <Link href="/clients" className="ox-btn ox-btn-ghost">Voir les clients</Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ padding: "8px 10px", borderRadius: 8, background: "var(--surface-soft)", border: "1px solid var(--border)" }}>
      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
      <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-strong)" }}>{value}</div>
    </div>
  );
}
