import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/require-user";
import { importGeneralPartsCatalog } from "@/app/catalogue-pieces/actions";

const IMPORT_ROLES = ["PDG", "DG", "COMPTA", "STOCK_GARAGE", "ADMIN"] as const;

export default async function ImportPartsCsvPage({
  searchParams,
}: {
  searchParams: Promise<{ imported?: string; skipped?: string }>;
}) {
  const user = await requireUser([...IMPORT_ROLES]);
  const params = await searchParams;

  return (
    <AppShell user={user} title="Import du catalogue pièces">
      <div style={{ display: "grid", gap: "1rem", maxWidth: 900 }}>
        <div className="ox-glass" style={{ padding: "1.1rem 1.2rem" }}>
          <h1 style={{ margin: 0, fontSize: "1.2rem" }}>Import CSV du catalogue pièces</h1>
          <p style={{ margin: "6px 0 0", opacity: 0.7, fontSize: "0.84rem" }}>
            Chargez un fichier de références fournisseur ou constructeur. Formats acceptés : CSV, Excel et JSON.
            Le fichier import_catalogue.csv de la base de références est reconnu.
          </p>
        </div>

        <form
          action={importGeneralPartsCatalog}
          encType="multipart/form-data"
          className="ox-glass"
          style={{ padding: "1rem 1.2rem", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}
        >
          <input type="file" name="file" accept=".csv,.xlsx,.xls,.json" required className="ox-input" style={{ padding: 7 }} />
          <button type="submit" className="ox-btn ox-btn-primary ox-btn-sm">Importer</button>
          <a href="/templates/catalogue-pieces-modele.csv" className="ox-btn ox-btn-ghost ox-btn-sm" download>Télécharger le modèle CSV</a>
        </form>

        {(params.imported || params.skipped) && (
          <div className="ox-glass" style={{ padding: "0.8rem 1rem", fontSize: "0.84rem", color: "var(--success-fg)" }}>
            Import terminé : {params.imported || 0} référence(s) importée(s), {params.skipped || 0} ligne(s) ignorée(s).
          </div>
        )}
      </div>
    </AppShell>
  );
}
