"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import * as XLSX from "xlsx";
import { CheckCircle2, FileSpreadsheet, Loader2, Upload, X } from "lucide-react";
import {
  STOCK_IMPORT_MAX_ROWS,
  isIncompleteStockRow,
  mapStockHeaders,
  validateStockRow,
  type StockImportPayloadRow,
  type StockImportPreparedRow,
} from "@/lib/stock-import";
import { importStockVehicles } from "./actions";

const MAX_FILE_BYTES = 8 * 1024 * 1024;

function cell(value: unknown): string {
  return String(value ?? "").trim();
}

function buildPreparedRows(matrix: unknown[][]): StockImportPreparedRow[] {
  const headerIndex = matrix.findIndex((row) => {
    const normalized = row.map((value) => cell(value).toLowerCase());
    return normalized.some((value) => value.includes("marque")) && normalized.some((value) => value.includes("vin"));
  });
  if (headerIndex < 0) throw new Error("Ligne d'en-têtes introuvable. Le fichier doit contenir Marque et VIN.");

  const headers = matrix[headerIndex].map((value, index) => cell(value) || `Colonne ${index + 1}`);
  const mapping = mapStockHeaders(headers);
  const rows = matrix.slice(headerIndex + 1).filter((row) => row.some((value) => cell(value) !== ""));
  if (rows.length > STOCK_IMPORT_MAX_ROWS) throw new Error(`Trop de lignes. Maximum ${STOCK_IMPORT_MAX_ROWS}.`);

  const seen = new Set<string>();
  return rows.map((raw, index) => {
    const get = (key: keyof typeof mapping) => {
      const header = mapping[key];
      if (!header) return "";
      return cell(raw[headers.indexOf(header)]);
    };
    const row: StockImportPayloadRow = {
      excelRow: headerIndex + index + 2,
      brand: get("brand"),
      model: get("model"),
      trim: get("trim"),
      year: get("year"),
      energy: get("energy"),
      engine: get("engine"),
      transmission: get("transmission"),
      gearbox: get("gearbox"),
      seats: get("seats"),
      otherFeatures: get("otherFeatures"),
      exteriorColorBase: get("exteriorColorBase"),
      exteriorColorShade: get("exteriorColorShade"),
      interiorColor: get("interiorColor"),
      vin: get("vin").toUpperCase(),
      status: get("status"),
      site: get("site"),
      arrivalDate: get("arrivalDate"),
    };
    const errors = validateStockRow(row);
    const duplicateInFile = Boolean(row.vin && seen.has(row.vin));
    if (row.vin) seen.add(row.vin);
    if (duplicateInFile) errors.push("VIN dupliqué dans le fichier");
    return { row, errors, duplicateInFile };
  });
}

export function StockImportView() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [prepared, setPrepared] = useState<StockImportPreparedRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Awaited<ReturnType<typeof importStockVehicles>> | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const validRows = useMemo(() => prepared.filter((item) => item.errors.length === 0), [prepared]);
  const invalidRows = prepared.length - validRows.length;
  const incompleteRows = validRows.filter((item) => isIncompleteStockRow(item.row)).length;

  async function handleFile(file: File | null | undefined) {
    if (!file) return;
    setError(null);
    setResult(null);
    if (file.size > MAX_FILE_BYTES) {
      setError("Fichier trop volumineux (max 8 Mo).");
      return;
    }
    setIsReading(true);
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const sheetName = workbook.SheetNames.find((name) => name.toLowerCase().includes("stock global")) ?? workbook.SheetNames[0];
      if (!sheetName) throw new Error("Aucune feuille dans le classeur.");
      const matrix = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[sheetName], {
        header: 1,
        defval: "",
        raw: false,
      }) as unknown[][];
      const rows = buildPreparedRows(matrix);
      if (rows.length === 0) throw new Error("Aucune ligne de véhicule détectée.");
      setFileName(file.name);
      setPrepared(rows);
    } catch (readError) {
      setError(readError instanceof Error ? readError.message : "Fichier illisible.");
      setFileName(null);
      setPrepared([]);
    } finally {
      setIsReading(false);
    }
  }

  function submit() {
    if (validRows.length === 0 || isPending) return;
    startTransition(async () => {
      try {
        const batchSize = 5;
        let created = 0;
        let updated = 0;
        let anomalies = 0;
        const errors: { excelRow: number; message: string }[] = [];
        const missing = new Set<string>();
        for (let index = 0; index < validRows.length; index += batchSize) {
          const response = await importStockVehicles(
            validRows.slice(index, index + batchSize).map(({ row }) => {
              const { excelRow: _excelRow, ...payload } = row;
              return payload;
            }),
          );
          created += response.created;
          updated += response.updated;
          anomalies += response.anomalies;
          errors.push(...response.errors);
          response.missingVins.forEach((vin) => missing.add(vin));
        }
        setResult({ created, updated, anomalies, total: validRows.length, missingVins: Array.from(missing), errors });
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Erreur pendant l'import.");
      }
    });
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section className="ox-glass" style={{ padding: "1rem 1.2rem", borderRadius: 14 }}>
        <h1 style={{ margin: 0, fontSize: "1.15rem" }}>Importer le stock depuis Excel</h1>
        <p style={{ margin: "6px 0 12px", opacity: 0.75, fontSize: "0.86rem", lineHeight: 1.5 }}>
          Onglet `Stock Global`, en-têtes en ligne 4. Clé d'import : VIN. Aucun véhicule absent du fichier ne sera supprimé.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          style={{ display: "none" }}
          onChange={(event) => void handleFile(event.target.files?.[0])}
        />
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button type="button" className="ox-btn ox-btn-primary" onClick={() => inputRef.current?.click()} disabled={isReading}>
            {isReading ? <Loader2 size={16} /> : <Upload size={16} />}
            {isReading ? "Lecture..." : "Choisir le fichier Excel"}
          </button>
          {fileName && (
            <button type="button" className="ox-btn" onClick={() => { setFileName(null); setPrepared([]); setResult(null); setError(null); if (inputRef.current) inputRef.current.value = ""; }}>
              <X size={15} /> Retirer
            </button>
          )}
          <span style={{ fontSize: "0.82rem", opacity: 0.7 }}>{fileName ?? "Aucun fichier sélectionné"}</span>
          <a href="/api/vehicles/export" className="ox-btn ox-btn-ghost" style={{ textDecoration: "none" }}>
            Exporter le stock
          </a>
        </div>
      </section>

      {error && (
        <div style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(225,29,72,0.4)", background: "rgba(225,29,72,0.1)", color: "#fda4af", fontSize: "0.85rem" }}>
          {error}
        </div>
      )}

      {prepared.length > 0 && (
        <section className="ox-glass" style={{ padding: "1rem 1.2rem", borderRadius: 14 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
            <strong>{prepared.length} lignes</strong>
            <span style={{ color: "#86efac" }}>{validRows.length} valides</span>
            <span style={{ color: "#fda4af" }}>{invalidRows} anomalies</span>
            <span style={{ opacity: 0.7 }}>{incompleteRows} fiches incomplètes importables</span>
          </div>
          <div style={{ maxHeight: 330, overflow: "auto", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
              <thead>
                <tr style={{ textAlign: "left", background: "rgba(255,255,255,0.04)" }}>
                  <th style={{ padding: 6 }}>Ligne</th>
                  <th style={{ padding: 6 }}>VIN</th>
                  <th style={{ padding: 6 }}>Véhicule</th>
                  <th style={{ padding: 6 }}>Site</th>
                  <th style={{ padding: 6 }}>Diagnostic</th>
                </tr>
              </thead>
              <tbody>
                {prepared.map((item) => (
                  <tr key={`${item.row.excelRow}-${item.row.vin}`} style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                    <td style={{ padding: 6 }}>{item.row.excelRow}</td>
                    <td style={{ padding: 6 }}>{item.row.vin || "-"}</td>
                    <td style={{ padding: 6 }}>{item.row.brand} {item.row.model} {item.row.trim}</td>
                    <td style={{ padding: 6 }}>{item.row.site || "-"}</td>
                    <td style={{ padding: 6, color: item.errors.length ? "#fda4af" : "#86efac" }}>
                      {item.errors.length ? item.errors.join(" ; ") : "Prêt"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 12 }}>
            <button type="button" className="ox-btn ox-btn-primary" onClick={submit} disabled={isPending || validRows.length === 0}>
              {isPending ? <Loader2 size={16} /> : <FileSpreadsheet size={16} />}
              {isPending ? "Import en cours..." : `Importer ${validRows.length} véhicules`}
            </button>
          </div>
        </section>
      )}

      {result && (
        <section className="ox-glass" style={{ padding: "1rem 1.2rem", borderRadius: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <CheckCircle2 size={18} style={{ color: "#4ade80" }} />
            <strong>Import terminé</strong>
          </div>
          <p style={{ margin: 0, fontSize: "0.86rem" }}>
            {result.created} créés, {result.updated} mis à jour, {result.anomalies} anomalies.
          </p>
          {result.missingVins.length > 0 && (
            <p style={{ margin: "8px 0 0", fontSize: "0.82rem", color: "#fcd34d" }}>
              {result.missingVins.length} VIN présents en base ne figurent pas dans le fichier. Ils n'ont pas été supprimés.
            </p>
          )}
          {result.errors.length > 0 && (
            <details style={{ marginTop: 8, fontSize: "0.82rem" }}>
              <summary style={{ cursor: "pointer" }}>Voir les anomalies</summary>
              <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                {result.errors.map((item) => (
                  <li key={`${item.excelRow}-${item.message}`}>Ligne {item.excelRow} : {item.message}</li>
                ))}
              </ul>
            </details>
          )}
        </section>
      )}
    </div>
  );
}
