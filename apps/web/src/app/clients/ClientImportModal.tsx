"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import * as XLSX from "xlsx";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import {
  CLIENT_IMPORT_BATCH_SIZE,
  CLIENT_IMPORT_FIELDS,
  CLIENT_IMPORT_MAX_ROWS,
  EMAIL_REGEX,
  autoMapHeaders,
  buildTemplateRows,
  buildUniqueHeaders,
  detectHeaderRowIndex,
  headerScore,
  normalizeEmail,
  normalizePhone,
  type ClientImportFieldKey,
  type ClientImportPayloadRow,
  type ClientImportResult,
} from "@/lib/client-import";
import { importClients } from "./actions";

type Mapping = Partial<Record<ClientImportFieldKey, string>>;

type PreparedRow = {
  excelRow: number;
  row: ClientImportPayloadRow;
  errors: string[];
  duplicateInFile: boolean;
};

const MAX_FILE_BYTES = 15 * 1024 * 1024;
const MAX_FILE_LABEL = "15 Mo";

/** Une feuille exploitable du classeur, avec sa ligne d'en-têtes déjà repérée. */
type SheetOption = {
  name: string;
  headers: string[];
  headerRowIndex: number;
  rows: Record<string, string>[];
  score: number;
};

/**
 * Transforme chaque feuille du classeur en table exploitable. Les classeurs
 * réels commencent souvent par une page de garde ou un sommaire : lire
 * aveuglément la première feuille importait des lignes vides ou le titre du
 * fichier à la place des clients.
 */
function readSheetOptions(workbook: XLSX.WorkBook): SheetOption[] {
  const options: SheetOption[] = [];

  for (const name of workbook.SheetNames) {
    const worksheet = workbook.Sheets[name];
    if (!worksheet) continue;

    const matrix = XLSX.utils.sheet_to_json<string[]>(worksheet, {
      header: 1,
      defval: "",
      raw: false,
    }) as unknown as string[][];

    const headerIndex = detectHeaderRowIndex(matrix);
    if (headerIndex < 0) continue;

    const headers = buildUniqueHeaders(matrix[headerIndex] ?? []);
    const rows = matrix
      .slice(headerIndex + 1)
      .filter((row) => (row ?? []).some((cell) => String(cell ?? "").trim() !== ""))
      .map((row) =>
        Object.fromEntries(headers.map((header, index) => [header, String(row[index] ?? "").trim()]))
      );

    if (rows.length === 0) continue;
    options.push({
      name,
      headers,
      headerRowIndex: headerIndex,
      rows,
      score: headerScore(matrix[headerIndex] ?? []),
    });
  }

  return options;
}

/** Feuille retenue par défaut : la mieux reconnue, puis la plus fournie. */
function pickBestSheet(options: SheetOption[]): SheetOption | undefined {
  return [...options].sort((a, b) => b.score - a.score || b.rows.length - a.rows.length)[0];
}

function chunkRows<T>(rows: T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let index = 0; index < rows.length; index += size) {
    batches.push(rows.slice(index, index + size));
  }
  return batches;
}

function buildPreparedRow(
  raw: Record<string, string>,
  mapping: Mapping,
  index: number,
  firstDataRow: number
): PreparedRow {
  const get = (key: ClientImportFieldKey): string => {
    const header = mapping[key];
    return header ? String(raw[header] ?? "").trim() : "";
  };

  const row: ClientImportPayloadRow = {
    contactName: get("contactName"),
    companyName: get("companyName"),
    email: normalizeEmail(get("email")) ?? "",
    phone: normalizePhone(get("phone")) ?? "",
    city: get("city"),
    address: get("address"),
    ifu: get("ifu"),
    category: get("category"),
    notes: get("notes"),
  };

  const errors: string[] = [];
  if (!row.contactName) errors.push("Nom du contact obligatoire");
  if (row.email && !EMAIL_REGEX.test(row.email)) errors.push("E-mail invalide");

  return { excelRow: firstDataRow + index, row, errors, duplicateInFile: false };
}

export function ClientImportModal({
  onClose,
  onImported,
}: {
  onClose: () => void;
  onImported: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [sheets, setSheets] = useState<SheetOption[]>([]);
  const [sheetName, setSheetName] = useState<string | null>(null);
  const [mapping, setMapping] = useState<Mapping>({});
  const [parseError, setParseError] = useState<string | null>(null);
  const [result, setResult] = useState<ClientImportResult | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isReading, setIsReading] = useState(false);

  const activeSheet = sheets.find((sheet) => sheet.name === sheetName) ?? null;
  const headers = activeSheet?.headers ?? [];
  const rawRows = activeSheet?.rows ?? [];
  // Numéro de la première ligne de données dans le tableur (en-têtes + 1).
  const firstDataRow = (activeSheet?.headerRowIndex ?? 0) + 2;

  const prepared = useMemo<PreparedRow[]>(() => {
    const rows = rawRows.map((raw, i) => buildPreparedRow(raw, mapping, i, firstDataRow));

    // Détection des doublons e-mail/téléphone à l'intérieur du fichier.
    const emails = new Set<string>();
    const phones = new Set<string>();
    for (const item of rows) {
      const email = item.row.email;
      const phone = item.row.phone;
      const isDuplicate = Boolean(
        (email && emails.has(email)) || (phone && phones.has(phone))
      );
      item.duplicateInFile = isDuplicate;
      if (email) emails.add(email);
      if (phone) phones.add(phone);
    }
    return rows;
  }, [rawRows, mapping, firstDataRow]);

  const validRows = prepared.filter((r) => r.errors.length === 0 && !r.duplicateInFile);
  const invalidCount = prepared.filter((r) => r.errors.length > 0).length;
  const duplicateCount = prepared.filter((r) => r.duplicateInFile).length;
  const canSubmit =
    Boolean(mapping.contactName) && validRows.length > 0 && !isPending && !isReading;

  async function handleFile(file: File | null | undefined) {
    if (!file) return;
    setParseError(null);
    setResult(null);
    if (file.size > MAX_FILE_BYTES) {
      setParseError(`Fichier trop volumineux (max ${MAX_FILE_LABEL}).`);
      return;
    }

    setIsReading(true);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      if (workbook.SheetNames.length === 0) throw new Error("Aucune feuille dans le classeur.");

      const options = readSheetOptions(workbook);
      const best = pickBestSheet(options);
      if (!best) throw new Error("Aucune ligne de données détectée dans ce fichier.");
      if (best.rows.length > CLIENT_IMPORT_MAX_ROWS) {
        throw new Error(
          `Trop de lignes : ${best.rows.length}. Maximum autorisé : ${CLIENT_IMPORT_MAX_ROWS} par import.`
        );
      }

      setFileName(file.name);
      setSheets(options);
      setSheetName(best.name);
      setMapping(autoMapHeaders(best.headers));
    } catch (error) {
      setParseError(error instanceof Error ? error.message : "Fichier illisible.");
      setFileName(null);
      setSheets([]);
      setSheetName(null);
      setMapping({});
    } finally {
      setIsReading(false);
    }
  }

  function downloadTemplate() {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(buildTemplateRows());
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clients");
    XLSX.writeFile(workbook, "modele-import-clients-carzone.xlsx");
  }

  function submit() {
    if (!canSubmit) return;
    const batches = chunkRows(validRows.map((item) => item.row), CLIENT_IMPORT_BATCH_SIZE);

    startTransition(async () => {
      const aggregate: ClientImportResult = {
        created: 0,
        skippedDuplicates: 0,
        invalid: 0,
        total: 0,
        errors: [],
      };
      setParseError(null);
      setProgress({ done: 0, total: batches.length });

      try {
        for (let index = 0; index < batches.length; index += 1) {
          const response = await importClients({ rows: batches[index] });
          aggregate.created += response.created;
          aggregate.skippedDuplicates += response.skippedDuplicates;
          aggregate.invalid += response.invalid;
          aggregate.total += response.total;
          aggregate.errors = aggregate.errors.concat(response.errors).slice(0, 50);
          setProgress({ done: index + 1, total: batches.length });
        }
        setResult(aggregate);
        onImported();
      } catch (error) {
        // Les lots déjà traités sont enregistrés : on le dit plutôt que de
        // laisser croire que rien n'a été importé.
        const detail = error instanceof Error ? error.message : "Erreur inconnue.";
        setParseError(
          aggregate.created > 0
            ? `${aggregate.created} client(s) importé(s) avant l'interruption. Erreur : ${detail}`
            : `Erreur pendant l'import des clients. ${detail}`
        );
        if (aggregate.created > 0) onImported();
      } finally {
        setProgress(null);
      }
    });
  }

  function reset() {
    setFileName(null);
    setSheets([]);
    setSheetName(null);
    setMapping({});
    setResult(null);
    setParseError(null);
    setProgress(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--surface-sunken)",
        backdropFilter: "blur(6px)",
        display: "grid",
        placeItems: "center",
        zIndex: 1100,
        padding: 16,
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Importer des clients depuis Excel"
    >
      <div
        className="ox-glass"
        style={{
          width: "100%",
          maxWidth: 960,
          maxHeight: "92vh",
          overflowY: "auto",
          padding: "1.4rem 1.6rem",
          display: "grid",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.15rem", display: "flex", alignItems: "center", gap: 8 }}>
              <FileSpreadsheet size={20} />
              Importer des clients depuis Excel
            </h2>
            <p style={{ margin: "4px 0 0", opacity: 0.7, fontSize: "0.86rem" }}>
              Fichiers acceptés : .xlsx, .xls, .csv - {CLIENT_IMPORT_MAX_ROWS.toLocaleString("fr-BJ")} lignes maximum ({MAX_FILE_LABEL}).
            </p>
          </div>
          <button type="button" className="ox-btn ox-btn-ghost" onClick={onClose} aria-label="Fermer">
            <X size={18} />
          </button>
        </div>

        {!result && (
          <>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(event) => {
                  void handleFile(event.target.files?.[0]);
                }}
                style={{ display: "none" }}
                id="client-import-file"
              />
              <button
                type="button"
                className="ox-btn"
                onClick={() => inputRef.current?.click()}
                disabled={isReading || isPending}
              >
                {isReading ? <Loader2 size={16} className="ox-spin" /> : <Upload size={16} />}
                <span style={{ marginLeft: 6 }}>{fileName ? "Changer de fichier" : "Choisir un fichier Excel"}</span>
              </button>
              <button type="button" className="ox-btn ox-btn-ghost" onClick={downloadTemplate} disabled={isPending}>
                <Download size={16} style={{ marginRight: 6 }} />
                Télécharger le modèle
              </button>
            </div>

            {fileName && (
              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                  Fichier sélectionné : <strong>{fileName}</strong> - {rawRows.length} ligne(s) détectée(s)
                  {activeSheet ? ` sur la feuille « ${activeSheet.name} »` : ""}.
                </div>
                {sheets.length > 1 && (
                  <label style={{ display: "grid", gap: 4, fontSize: "0.82rem", maxWidth: 360 }}>
                    <span style={{ opacity: 0.8 }}>Feuille à importer</span>
                    <select
                      className="ox-select"
                      value={sheetName ?? ""}
                      onChange={(event) => {
                        const next = sheets.find((sheet) => sheet.name === event.target.value);
                        if (!next) return;
                        setSheetName(next.name);
                        setMapping(autoMapHeaders(next.headers));
                      }}
                      disabled={isPending}
                    >
                      {sheets.map((sheet) => (
                        <option key={sheet.name} value={sheet.name}>
                          {sheet.name} ({sheet.rows.length} ligne(s))
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
            )}

            {parseError && (
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "flex-start",
                  padding: "0.7rem 0.9rem",
                  borderRadius: 10,
                  background: "var(--danger-soft)",
                  border: "1px solid var(--danger)",
                  color: "var(--danger-fg)",
                  fontSize: "0.88rem",
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{parseError}</span>
              </div>
            )}

            {rawRows.length > 0 && (
              <>
                <div>
                  <h3 style={{ margin: "0 0 8px", fontSize: "0.98rem" }}>Correspondance des colonnes</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
                    {CLIENT_IMPORT_FIELDS.map((field) => (
                      <label key={field.key} style={{ display: "grid", gap: 4, fontSize: "0.82rem" }}>
                        <span style={{ opacity: 0.8 }}>
                          {field.label}
                          {field.required ? " *" : ""}
                        </span>
                        <select
                          className="ox-select"
                          value={mapping[field.key] ?? ""}
                          onChange={(event) =>
                            setMapping((current) => ({
                              ...current,
                              [field.key]: event.target.value || undefined,
                            }))
                          }
                          disabled={isPending}
                        >
                          <option value="">- Ignorer -</option>
                          {headers.map((header) => (
                            <option key={header} value={header}>
                              {header}
                            </option>
                          ))}
                        </select>
                      </label>
                    ))}
                  </div>
                  {!mapping.contactName && (
                    <p style={{ color: "var(--danger-fg)", fontSize: "0.82rem", margin: "8px 0 0" }}>
                      La colonne « Nom du contact » doit être associée pour importer.
                    </p>
                  )}
                </div>

                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: "0.84rem" }}>
                  <span>
                    <CheckCircle2 size={15} style={{ verticalAlign: "-2px", marginRight: 4 }} />
                    {validRows.length} prête(s)
                  </span>
                  <span style={{ opacity: 0.75 }}>{duplicateCount} doublon(s) dans le fichier</span>
                  <span style={{ opacity: 0.75 }}>{invalidCount} ligne(s) en erreur</span>
                </div>

                <div className="ox-table-wrap">
                  <table className="ox-table" style={{ fontSize: "0.82rem" }}>
                    <thead>
                      <tr>
                        <th>Ligne</th>
                        <th>Nom du contact</th>
                        <th>Société</th>
                        <th>E-mail</th>
                        <th>Téléphone</th>
                        <th>Ville</th>
                        <th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prepared.slice(0, 10).map((item) => (
                        <tr key={item.excelRow}>
                          <td style={{ opacity: 0.6 }}>{item.excelRow}</td>
                          <td>{item.row.contactName || "-"}</td>
                          <td>{item.row.companyName || "-"}</td>
                          <td>{item.row.email || "-"}</td>
                          <td>{item.row.phone || "-"}</td>
                          <td>{item.row.city || "Cotonou"}</td>
                          <td>
                            {item.errors.length > 0 ? (
                              <span style={{ color: "var(--danger-fg)" }}>{item.errors[0]}</span>
                            ) : item.duplicateInFile ? (
                              <span style={{ color: "var(--warning-fg)" }}>Doublon fichier</span>
                            ) : (
                              <span style={{ color: "var(--success-fg)" }}>OK</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {prepared.length > 10 && (
                  <p style={{ margin: 0, opacity: 0.6, fontSize: "0.8rem" }}>
                    Aperçu des 10 premières lignes sur {prepared.length}.
                  </p>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
                  <button type="button" className="ox-btn ox-btn-ghost" onClick={onClose} disabled={isPending}>
                    Annuler
                  </button>
                  <button type="button" className="ox-btn" onClick={submit} disabled={!canSubmit}>
                    {isPending ? <Loader2 size={16} className="ox-spin" /> : <CheckCircle2 size={16} />}
                    <span style={{ marginLeft: 6 }}>
                      {progress && progress.total > 1
                        ? `Import en cours - lot ${progress.done}/${progress.total}`
                        : `Importer ${validRows.length} client${validRows.length > 1 ? "s" : ""}`}
                    </span>
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {result && (
          <div style={{ display: "grid", gap: 12 }}>
            <div
              style={{
                padding: "0.9rem 1rem",
                borderRadius: 12,
                background: "var(--success-soft)",
                border: "1px solid var(--success)",
              }}
            >
              <strong>Import terminé.</strong> {result.created} client(s) créé(s),{" "}
              {result.skippedDuplicates} doublon(s) ignoré(s), {result.invalid} ligne(s) invalide(s).
            </div>
            {result.errors.length > 0 && (
              <div style={{ fontSize: "0.82rem", opacity: 0.85, maxHeight: 180, overflowY: "auto" }}>
                <div style={{ marginBottom: 4, fontWeight: 600 }}>Détail des lignes ignorées :</div>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {result.errors.map((error) => (
                    <li key={`${error.row}-${error.message}`}>
                      Ligne {error.row} : {error.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
              <button type="button" className="ox-btn ox-btn-ghost" onClick={reset}>
                Importer un autre fichier
              </button>
              <button type="button" className="ox-btn" onClick={onClose}>
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
