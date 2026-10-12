import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatXof, nextDocNumber } from "@/lib/format";

/**
 * Endpoint Webhook pour l'Assistant Vocal IA (VAPI.ai)
 * Gère le Function Calling / Tool Calling en temps réel pendant les appels
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body.message || body;

    // VAPI envoie différents types d'événements
    const messageType = message.type;

    if (messageType === "function-call" || body.functionCall) {
      const fn = message.functionCall || body.functionCall;
      const fnName = fn.name;
      const params = fn.parameters || {};

      let result: Record<string, unknown> = {};

      switch (fnName) {
        // 1. Consultation du stock véhicules électriques
        case "check_vehicle_stock": {
          const brandFilter = params.brand ? String(params.brand) : undefined;
          const modelFilter = params.model ? String(params.model) : undefined;

          const vehicles = await prisma.vehicle.findMany({
            where: {
              status: "EN_STOCK",
              ...(brandFilter ? { brand: { contains: brandFilter } } : {}),
              ...(modelFilter ? { model: { contains: modelFilter } } : {}),
            },
            take: 5,
            select: {
              id: true,
              brand: true,
              model: true,
              variant: true,
              color: true,
              priceXof: true,
              energy: true,
              vin: true,
            },
          });

          result = {
            available: vehicles.length > 0,
            count: vehicles.length,
            message:
              vehicles.length > 0
                ? `Nous avons actuellement ${vehicles.length} véhicule(s) disponible(s) immédiatement au showroom d'Akpakpa.`
                : "Aucun véhicule correspondant n'est disponible en stock immédiat, mais des arrivages maritimes sont en cours.",
            vehicles: vehicles.map((v) => ({
              description: `${v.brand} ${v.model} ${v.variant || ""} (${v.color || "Standard"})`,
              prixFCFA: formatXof(v.priceXof),
              prixBrut: v.priceXof,
              energie: v.energy,
            })),
          };
          break;
        }

        // 2. Création automatique d'une proforma suite à l'appel
        case "create_voice_quote": {
          const contactName = String(params.customerName || "Prospect Téléphonique");
          const phone = String(params.phone || "");
          const vehicleModel = String(params.vehicleModel || "BYD Dolphin");

          // Trouver ou créer le client
          let customer = phone
            ? await prisma.customer.findFirst({ where: { phone } })
            : null;

          if (!customer) {
            customer = await prisma.customer.create({
              data: {
                contactName,
                phone: phone || null,
                category: "PROSPECT_VOCAL_VAPI",
                city: "Cotonou",
              },
            });
          }

          // Trouver un véhicule ou prix par défaut
          const vehicle = await prisma.vehicle.findFirst({
            where: {
              model: { contains: vehicleModel },
              status: "EN_STOCK",
            },
          });

          const priceXof = vehicle?.priceXof || 18500000;
          const count = await prisma.quote.count();
          const quoteNumber = nextDocNumber("PRO", count);

          const quote = await prisma.quote.create({
            data: {
              number: quoteNumber,
              customerId: customer.id,
              status: "BROUILLON",
              docKind: "PROFORMA",
              taxMode: "HT",
              taxRatePct: 18,
              subtotalHtXof: priceXof,
              taxXof: Math.round(priceXof * 0.18),
              totalXof: Math.round(priceXof * 1.18),
              notes: `Devis généré automatiquement par l'assistant IA vocal VAPI lors d'un appel téléphonique le ${new Date().toLocaleDateString("fr-BJ")}. Modèle demandé : ${vehicleModel}.`,
              lines: {
                create: [
                  {
                    description: vehicle
                      ? `${vehicle.brand} ${vehicle.model} ${vehicle.variant || ""}`
                      : `Véhicule électrique ${vehicleModel}`,
                    quantity: 1,
                    unitPriceXof: priceXof,
                    vehicleId: vehicle?.id || null,
                  },
                ],
              },
            },
          });

          result = {
            success: true,
            quoteNumber: quote.number,
            client: customer.contactName,
            totalFCFA: formatXof(quote.totalXof),
            message: `La facture proforma ${quote.number} d'un montant de ${formatXof(quote.totalXof)} a été créée avec succès dans notre système. Un conseiller commercial CARZONE SARL va vous contacter.`,
          };
          break;
        }

        // 3. Réservation d'un essai routier (Test Drive)
        case "book_test_drive": {
          const contactName = String(params.customerName || "Client Essai");
          const phone = String(params.phone || "");
          const preferredDate = String(params.preferredDate || "Demain à 10h00");
          const vehicleModel = String(params.vehicleModel || "BYD");

          let customer = phone
            ? await prisma.customer.findFirst({ where: { phone } })
            : null;

          if (!customer) {
            customer = await prisma.customer.create({
              data: {
                contactName,
                phone: phone || null,
                category: "PROSPECT_ESSAI",
              },
            });
          }

          const opp = await prisma.opportunity.create({
            data: {
              title: `Essai Routier — ${vehicleModel} (${contactName})`,
              customerId: customer.id,
              stage: "ESSAI",
              amountXof: 0,
              notes: `Réservation d'essai routier prise par l'assistant vocal VAPI. Date souhaitée : ${preferredDate}. Téléphone client : ${phone}.`,
            },
          });

          result = {
            success: true,
            bookingId: opp.id,
            message: `Votre essai routier pour le modèle ${vehicleModel} a été pré-réservé pour ${preferredDate} au showroom CARZONE SARL de Saint-Michel (Immeuble CBDH). Notre équipe commerciale vous attend avec les clés !`,
          };
          break;
        }

        // 4. Consultation des bornes de recharge et tarifs
        case "check_charging_stations": {
          const stations = await prisma.chargingStation.findMany({
            where: { active: true },
            select: { code: true, name: true, address: true, powerKw: true },
          });

          result = {
            stationsCount: stations.length,
            stations: stations.map((s) => ({
              nom: s.name,
              puissance: s.powerKw ? `${s.powerKw} kW` : "Rapide",
              adresse: s.address || "Cotonou",
            })),
            tarifs: {
              tarifPublic: "125 FCFA par kWh",
              tarifAbonneClub: "90 FCFA par kWh (soit 28% d'économie immédiate)",
            },
            message: `CARZONE SARL dispose de ${stations.length} stations de recharge rapide opérationnelles à Cotonou. Le tarif est de 125 FCFA/kWh en accès public, et de 90 FCFA/kWh pour les abonnés au Club CARZONE VIP.`,
          };
          break;
        }

        // 5. Suivi d'un véhicule à l'Atelier SAV PK3
        case "track_sav_repair": {
          const query = String(params.phone || params.vin || "");
          const workOrder = await prisma.workOrder.findFirst({
            where: {
              OR: [
                { vehicle: { vin: { contains: query } } },
                { description: { contains: query } },
                { customerName: { contains: query } },
              ],
            },
            orderBy: { createdAt: "desc" },
            include: { vehicle: true },
          });

          if (!workOrder) {
            result = {
              found: false,
              message: "Aucun ordre de réparation en cours n'a été trouvé avec ces références. Veuillez vérifier le numéro ou contacter directement l'Atelier SAV PK3 au +229 21 33 00 00.",
            };
          } else {
            result = {
              found: true,
              numeroOrdre: workOrder.number,
              statut: workOrder.status,
              vehicule: workOrder.vehicle ? `${workOrder.vehicle.brand} ${workOrder.vehicle.model}` : "Véhicule Client",
              diagnostic: workOrder.diagnosis || "En cours d'inspection par nos techniciens haute tension",
              message: `Votre véhicule (Ordre ${workOrder.number}) est actuellement au statut : ${workOrder.status}. ${workOrder.diagnosis ? `Diagnostic : ${workOrder.diagnosis}` : "Les travaux sont en cours."}`,
            };
          }
          break;
        }

        default:
          result = {
            error: `Fonction inconnue: ${fnName}`,
          };
      }

      return NextResponse.json({ result });
    }

    // Ping ou statut VAPI
    return NextResponse.json({ ok: true, service: "CARZONE Ops VAPI Voice AI Bridge", time: new Date().toISOString() });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Erreur interne webhook VAPI";
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: "CARZONE Ops VAPI Voice Assistant Webhook",
    status: "online",
    availableTools: [
      "check_vehicle_stock",
      "create_voice_quote",
      "book_test_drive",
      "check_charging_stations",
      "track_sav_repair",
    ],
    documentation: "/docs/VAPI-INTEGRATION-CARZONE.md",
  });
}
