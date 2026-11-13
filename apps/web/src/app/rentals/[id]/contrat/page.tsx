import { notFound } from "next/navigation";
import { randomUUID } from "node:crypto";
import { AppShell } from "@/components/AppShell";
import { RentalContractActions } from "@/components/RentalContractActions";
import { RentalBillingActions } from "../../RentalBillingActions";
import { RentalContractDocument } from "@/components/RentalContractDocument";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { rentalContractReference, rentalVehicleLabel } from "@/lib/rental-contract";
import { SITE_WEBSITE } from "@/lib/site-constants";
import { markRentalContractSigned } from "../../actions";

const RENTAL_ROLES = ["GESTIONNAIRE_LOCATION", "COMPTA", "DG", "PDG", "SG"] as const;
const MANAGE_ROLES = ["GESTIONNAIRE_LOCATION", "DG", "PDG", "SG"] as const;

export default async function RentalContractPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser([...RENTAL_ROLES]);
  const { id } = await params;

  const rental = await prisma.rental.findUnique({
    where: { id },
    include: {
      customer: true,
      // La version catalogue porte le nombre de places affiché à l'article 2 du contrat.
      vehicle: { include: { version: { select: { trim: true, seats: true } } } },
      deliveryNotes: { select: { id: true, number: true, kind: true }, orderBy: { createdAt: "desc" } },
      payments: { orderBy: { paidAt: "desc" } },
    },
  });
  if (!rental) notFound();

  let contractToken = rental.contractToken;
  if (!contractToken) {
    contractToken = randomUUID();
    await prisma.rental.update({ where: { id: rental.id }, data: { contractToken } });
  }

  const canManage = (MANAGE_ROLES as readonly string[]).includes(user.role);
  const publicUrl = `${SITE_WEBSITE.replace(/\/$/, "")}/contrat/${contractToken}`;
  const vehicleLabel = rentalVehicleLabel(rental.vehicle);

  return (
    <AppShell user={user} title="Contrat de location">
      <div style={{ display: "grid", gap: "1rem" }}>
        <div className="ox-glass" style={{ padding: "1rem 1.2rem", display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 800 }}>Contrat de location de véhicule</div>
            <div style={{ opacity: 0.68, fontSize: "0.82rem", marginTop: 2 }}>
              Imprimez le contrat, faites-le signer par le client et par CARZONE, puis envoyez-le par e-mail ou WhatsApp.
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a href="/rentals/fleet" className="ox-btn ox-btn-ghost ox-btn-sm">Retour au parc</a>
            <RentalContractActions
              publicUrl={publicUrl}
              customerEmail={rental.customer.email}
              customerPhone={rental.customer.phone}
              reference={rentalContractReference(rental.id)}
              vehicleLabel={vehicleLabel}
            />
          </div>
        </div>

        {canManage && (
          <div className="ox-glass" style={{ padding: "1rem 1.2rem", display: "grid", gap: 10 }}>
            <strong>Signatures</strong>
            {rental.signedAt ? (
              <p style={{ margin: 0, fontSize: "0.84rem", opacity: 0.8 }}>
                Contrat signé le {new Intl.DateTimeFormat("fr-BJ", { dateStyle: "long" }).format(rental.signedAt)}
                {" "}par {rental.signedByClient} (client) et {rental.signedByCompany} (CARZONE SARL).
              </p>
            ) : (
              <p style={{ margin: 0, fontSize: "0.84rem", opacity: 0.75 }}>
                Après signature manuscrite sur le document imprimé, enregistrez ici les deux signataires pour tracer la signature dans le dossier.
              </p>
            )}
            <form action={markRentalContractSigned} style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))" }}>
              <input type="hidden" name="id" value={rental.id} />
              <label style={{ display: "grid", gap: 4, fontSize: "0.8rem" }}>
                Nom du signataire client
                <input name="signedByClient" className="ox-input" defaultValue={rental.signedByClient || rental.customer.contactName} required />
              </label>
              <label style={{ display: "grid", gap: 4, fontSize: "0.8rem" }}>
                Nom du signataire CARZONE
                <input name="signedByCompany" className="ox-input" defaultValue={rental.signedByCompany || "Direction CARZONE SARL"} required />
              </label>
              <div style={{ display: "flex", alignItems: "end" }}>
                <button type="submit" className="ox-btn ox-btn-primary ox-btn-sm">
                  {rental.signedAt ? "Mettre à jour la signature" : "Marquer le contrat comme signé"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div style={{ overflowX: "auto", padding: "0.5rem 0" }}>
          {canManage && (
          <RentalBillingActions
            rentalId={rental.id}
            existingInternal={rental.deliveryNotes.find((note) => note.kind !== "CLIENT") || null}
            existingClient={rental.deliveryNotes.find((note) => note.kind === "CLIENT") || null}
          />
        )}

        <RentalContractDocument rental={rental} />
        </div>
      </div>
    </AppShell>
  );
}
