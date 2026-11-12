import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/require-user";
import { RentalWorkbookImport } from "./RentalWorkbookImport";

const IMPORT_ROLES = ["GESTIONNAIRE_LOCATION", "DG", "PDG", "SG"] as const;

export default async function RentalWorkbookImportPage() {
  const user = await requireUser([...IMPORT_ROLES]);

  return (
    <AppShell user={user} title="Importer la base clients location">
      <div style={{ display: "grid", gap: "1rem" }}>
        <div className="ox-glass" style={{ padding: "1rem 1.2rem", display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 800 }}>Base clients et location</div>
            <div style={{ fontSize: "0.82rem", opacity: 0.7, marginTop: 2 }}>
              Import du fichier Excel historique : clients, parc locatif et contrats. La confirmation est obligatoire avant écriture.
            </div>
          </div>
          <Link href="/rentals/fleet" className="ox-btn ox-btn-ghost">Retour au parc</Link>
        </div>
        <RentalWorkbookImport />
      </div>
    </AppShell>
  );
}
