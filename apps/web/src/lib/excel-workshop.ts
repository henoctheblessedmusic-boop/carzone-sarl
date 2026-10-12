import * as XLSX from "xlsx";

export type WorkshopExcelRow = {
  entryDate?: string;
  entryTime?: string;
  orNumber?: string;
  immatriculation: string;
  chassis?: string;
  brand?: string;
  model?: string;
  mileage?: number;
  clientName: string;
  clientType?: string;
  fuelLevel?: string;
  phone?: string;
  receptionist?: string;
  immobilizationDuration?: string;
  observations?: string;
  presenceSav?: string;
  statusCode: string;
  endWorksAt?: string;
  executionDuration?: string;
  worksDone?: string;
  exitDate?: string;
  exitTime?: string;
  deliverer?: string;
  paymentMode?: string;
};

// Formattage date Excel (nombre série ou chaîne)
function formatExcelDate(val: unknown): string {
  if (val === undefined || val === null || val === "") return "";
  if (typeof val === "number") {
    try {
      const dateObj = XLSX.SSF.parse_date_code(val);
      if (dateObj) {
        const d = String(dateObj.d).padStart(2, "0");
        const m = String(dateObj.m).padStart(2, "0");
        const y = String(dateObj.y).slice(-2);
        return `${d}/${m}/${y}`;
      }
    } catch {
      // fallback
    }
  }
  return String(val).trim();
}

function formatExcelTime(val: unknown): string {
  if (val === undefined || val === null || val === "") return "";
  if (typeof val === "number") {
    try {
      const dateObj = XLSX.SSF.parse_date_code(val);
      if (dateObj) {
        const h = String(dateObj.H).padStart(2, "0");
        const min = String(dateObj.M).padStart(2, "0");
        return `${h}:${min}`;
      }
    } catch {
      // fallback
    }
  }
  return String(val).trim();
}

export function parseWorkshopExcel(buffer: Buffer): { rows: WorkshopExcelRow[]; errorCount: number; sheetName: string } {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  
  // Chercher la feuille principale "Historique Entrée et Sortie Véh" ou la première feuille
  let sheetName = workbook.SheetNames[0];
  for (const name of workbook.SheetNames) {
    if (name.toLowerCase().includes("historique") || name.toLowerCase().includes("sav") || name.toLowerCase().includes("atelier")) {
      sheetName = name;
      break;
    }
  }

  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`Aucune feuille trouvée dans le fichier Excel.`);
  }

  const rawData: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  if (rawData.length === 0) {
    throw new Error("Le fichier Excel est vide.");
  }

  // Trouver la ligne d'en-tête (cherche la ligne qui contient "imm" ou "or" ou "marque" ou "châssis")
  let headerRowIndex = -1;
  for (let i = 0; i < Math.min(rawData.length, 25); i++) {
    const row = rawData[i];
    if (!Array.isArray(row)) continue;
    const rowText = row.map((c) => String(c || "").toLowerCase().trim()).join(" ");
    if (
      (rowText.includes("imm") || rowText.includes("immat")) &&
      (rowText.includes("marque") || rowText.includes("client") || rowText.includes("châssis") || rowText.includes("chassis"))
    ) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex === -1) {
    // Si pas trouvé de ligne explicite, on cherche la ligne avec le plus de colonnes texte
    headerRowIndex = 7; // Ligne 8 typique de leur modèle
  }

  const headerRow = (rawData[headerRowIndex] || []) as string[];
  const colMap: Record<string, number> = {};

  headerRow.forEach((colName, idx) => {
    const clean = String(colName || "")
      .toLowerCase()
      .trim()
      .replace(/[éèê]/g, "e")
      .replace(/[àâ]/g, "a")
      .replace(/[°_']/g, " ")
      .replace(/\s+/g, " ");

    if (clean.includes("date") && !clean.includes("fin") && !clean.includes("sortie")) colMap.entryDate = idx;
    else if (clean.includes("heure") && !clean.includes("sortie") && !clean.includes("fin")) colMap.entryTime = idx;
    else if (clean.includes("n or") || clean.includes("num or") || clean.includes("ordre") || (clean.includes("or") && clean.length <= 4)) colMap.orNumber = idx;
    else if (clean.includes("imm") || clean.includes("plaque") || clean.includes("immatriculation")) colMap.immatriculation = idx;
    else if (clean.includes("chassis") || clean.includes("vin")) colMap.chassis = idx;
    else if (clean.includes("marque")) colMap.brand = idx;
    else if (clean.includes("modele")) colMap.model = idx;
    else if (clean.includes("kilometr") || clean.includes("km")) colMap.mileage = idx;
    else if (clean.includes("client") && !clean.includes("type")) colMap.clientName = idx;
    else if (clean.includes("type client") || clean.includes("types client")) colMap.clientType = idx;
    else if (clean.includes("carburant") || clean.includes("essence") || clean.includes("gasoil")) colMap.fuelLevel = idx;
    else if (clean.includes("telephon") || clean.includes("tel") || clean.includes("contact")) colMap.phone = idx;
    else if (clean.includes("reception")) colMap.receptionist = idx;
    else if (clean.includes("immob")) colMap.immobilizationDuration = idx;
    else if (clean.includes("observ")) colMap.observations = idx;
    else if (clean.includes("presence") || clean.includes("sav")) colMap.presenceSav = idx;
    else if (clean.includes("statut") || clean.includes("niv exec")) colMap.statusCode = idx;
    else if (clean.includes("fin des travaux") || clean.includes("fin travaux")) colMap.endWorksAt = idx;
    else if (clean.includes("duree") && (clean.includes("exec") || clean.includes("travaux"))) colMap.executionDuration = idx;
    else if (clean.includes("travaux") || clean.includes("intervention")) colMap.worksDone = idx;
    else if (clean.includes("date de sortie") || clean.includes("date sortie")) colMap.exitDate = idx;
    else if (clean.includes("h de sortie") || clean.includes("heure sortie")) colMap.exitTime = idx;
    else if (clean.includes("livreur") || clean.includes("livre par")) colMap.deliverer = idx;
    else if (clean.includes("reglement") || clean.includes("mode") || clean.includes("paiement")) colMap.paymentMode = idx;
  });

  const rows: WorkshopExcelRow[] = [];
  const errorCount = 0;

  for (let r = headerRowIndex + 1; r < rawData.length; r++) {
    const raw = rawData[r] as unknown[];
    if (!raw || raw.length === 0) continue;

    const getVal = (key: string): string => {
      const idx = colMap[key];
      if (idx !== undefined && raw[idx] !== undefined && raw[idx] !== null) {
        return String(raw[idx]).trim();
      }
      return "";
    };

    const immat = getVal("immatriculation");
    const client = getVal("clientName");
    const brand = getVal("brand");
    const model = getVal("model");

    // Ligne vide ou non valide
    if (!immat && !client && !brand && !model) {
      continue;
    }

    const mileageRaw = colMap.mileage !== undefined ? raw[colMap.mileage] : null;
    let mileage: number | undefined = undefined;
    if (typeof mileageRaw === "number") {
      mileage = Math.round(mileageRaw);
    } else if (mileageRaw) {
      const cleanedNum = String(mileageRaw).replace(/[^0-9]/g, "");
      if (cleanedNum) mileage = parseInt(cleanedNum, 10);
    }

    let status = getVal("statusCode").toUpperCase();
    if (!status) status = "C";
    // Si libellé complet, normaliser vers les codes de légende de l'entreprise
    if (status.includes("ANNUL") || status === "ANN") status = "ANN";
    else if (status.includes("LIVR")) status = "L";
    else if (status.includes("FINI") || status.includes("TERMINE")) status = "F";
    else if (status.includes("ATTENTE PIECE") || status.includes("PIECE")) status = "AT";
    else if (status.includes("ACCORD")) status = "AC";
    else if (status.includes("DECAISSEMENT")) status = "ATD";
    else if (status.includes("DIAG")) status = "D";
    else if (status.includes("FAIRE")) status = "AF";
    else if (status.includes("HORS")) status = "HSAV";
    else if (status.includes("COURS")) status = "C";

    const entry: WorkshopExcelRow = {
      entryDate: formatExcelDate(colMap.entryDate !== undefined ? raw[colMap.entryDate] : getVal("entryDate")),
      entryTime: formatExcelTime(colMap.entryTime !== undefined ? raw[colMap.entryTime] : getVal("entryTime")),
      orNumber: getVal("orNumber") || undefined,
      immatriculation: immat || "IMM-INCONNUE",
      chassis: getVal("chassis") || undefined,
      brand: brand || undefined,
      model: model || undefined,
      mileage,
      clientName: client || "Client Anonyme",
      clientType: getVal("clientType") || "Client",
      fuelLevel: getVal("fuelLevel") || undefined,
      phone: getVal("phone") || undefined,
      receptionist: getVal("receptionist") || undefined,
      immobilizationDuration: getVal("immobilizationDuration") || undefined,
      observations: getVal("observations") || undefined,
      presenceSav: getVal("presenceSav") || "NON",
      statusCode: status,
      endWorksAt: getVal("endWorksAt") || undefined,
      executionDuration: getVal("executionDuration") || undefined,
      worksDone: getVal("worksDone") || undefined,
      exitDate: formatExcelDate(colMap.exitDate !== undefined ? raw[colMap.exitDate] : getVal("exitDate")),
      exitTime: formatExcelTime(colMap.exitTime !== undefined ? raw[colMap.exitTime] : getVal("exitTime")),
      deliverer: getVal("deliverer") || undefined,
      paymentMode: getVal("paymentMode") || undefined,
    };

    rows.push(entry);
  }

  return { rows, errorCount, sheetName };
}

export function exportWorkshopToExcel(entries: Array<{
  entryDate?: string | null;
  entryTime?: string | null;
  orNumber?: string | null;
  immatriculation: string;
  chassis?: string | null;
  brand?: string | null;
  model?: string | null;
  mileage?: number | null;
  clientName: string;
  clientType?: string | null;
  fuelLevel?: string | null;
  phone?: string | null;
  receptionist?: string | null;
  immobilizationDuration?: string | null;
  observations?: string | null;
  presenceSav?: string | null;
  statusCode: string;
  endWorksAt?: string | null;
  executionDuration?: string | null;
  worksDone?: string | null;
  exitDate?: string | null;
  exitTime?: string | null;
  deliverer?: string | null;
  paymentMode?: string | null;
}>): Buffer {
  const headers = [
    "Date",
    "Heure",
    "N° OR",
    "Imm",
    "Châssis",
    "Marque",
    "Modèles",
    "Kilométrage Km",
    "Clients",
    "Types clients",
    "Niveau carburant",
    "Téléphone",
    "Réceptionnaire",
    "Durée d'immob",
    "Observations",
    "Présence au SAV (Non/Oui)",
    "Statut (Niv Exéc)",
    "Date et H fin des travaux",
    "Durée d'exécution des travaux",
    "Travaux effectués",
    "Date de sortie Véh",
    "H de sortie",
    "Livreur",
    "Mode de Règlement",
  ];

  const data = [
    ["HISTORIQUE DE PASSAGE DES VEHICULES AU SAV"],
    ["LEGENDES: AT= Attente pièce; L= Livré; C= en Cours; F= Fini; D= Diagnostic; ATD= Attente décaissement; AC= Attente Accord client; AF= A Faire; HSAV= Hors SAV"],
    [],
    headers,
    ...entries.map((e) => [
      e.entryDate || "",
      e.entryTime || "",
      e.orNumber || "",
      e.immatriculation || "",
      e.chassis || "",
      e.brand || "",
      e.model || "",
      e.mileage ?? "",
      e.clientName || "",
      e.clientType || "Client",
      e.fuelLevel || "",
      e.phone || "",
      e.receptionist || "",
      e.immobilizationDuration || "",
      e.observations || "",
      e.presenceSav || "NON",
      e.statusCode || "C",
      e.endWorksAt || "",
      e.executionDuration || "",
      e.worksDone || "",
      e.exitDate || "",
      e.exitTime || "",
      e.deliverer || "",
      e.paymentMode || "",
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Historique Entrée et Sortie Véh");

  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
