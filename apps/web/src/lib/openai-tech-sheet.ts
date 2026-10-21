import { prisma } from "@/lib/prisma";
import type { TechnicalSheet } from "@/lib/tech-sheet-generator";
import { findCatalogSpecs } from "./vehicle-catalog-specs";
import { normalizeBrandName } from "./brand-logos";

// Marques automobiles chinoises partenaires de Carzone SARL
const CHINESE_BRANDS = new Set([
  "CHANGAN",
  "BAIC",
  "JETOUR",
  "FORTHING",
  "DONGFENG",
  "GEELY",
  "BYD",
  "HAVAL",
  "CHERY",
  "GWM",
  "TANK",
  "JAC",
  "FAW",
  "VOYAH",
  "LI AUTO",
  "NIO",
  "XPENG",
  "ZEEKR",
  "MAXUS",
  "WULING",
  "MG",
  "OMODA",
  "JAECOO",
]);

export function isChineseBrand(brand: string): boolean {
  const norm = normalizeBrandName(brand).toUpperCase();
  return CHINESE_BRANDS.has(norm);
}

export async function getOpenAIApiKey(): Promise<string | null> {
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().startsWith("sk-")) {
    return process.env.OPENAI_API_KEY.trim();
  }
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "OPENAI_API_KEY" },
    });
    if (setting && setting.value && setting.value.trim().startsWith("sk-")) {
      return setting.value.trim();
    }
  } catch (err) {
    console.error("Erreur lecture OPENAI_API_KEY en BDD:", err);
  }
  return null;
}

export async function getDeepSeekApiKey(): Promise<string | null> {
  if (process.env.DEEPSEEK_API_KEY && process.env.DEEPSEEK_API_KEY.trim().startsWith("sk-")) {
    return process.env.DEEPSEEK_API_KEY.trim();
  }
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "DEEPSEEK_API_KEY" },
    });
    if (setting && setting.value && setting.value.trim().startsWith("sk-")) {
      return setting.value.trim();
    }
  } catch (err) {
    console.error("Erreur lecture DEEPSEEK_API_KEY en BDD:", err);
  }
  return null;
}

export function getAiGatewayApiKey(): string | null {
  const key = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_API_KEY;
  if (key && key.trim().startsWith("vck_")) {
    return key.trim();
  }
  return null;
}

export async function setOpenAIApiKey(apiKey: string): Promise<void> {
  const cleanKey = apiKey.trim();
  await prisma.systemSetting.upsert({
    where: { key: "OPENAI_API_KEY" },
    create: { key: "OPENAI_API_KEY", value: cleanKey, category: "AI" },
    update: { value: cleanKey, category: "AI" },
  });
}

export async function setDeepSeekApiKey(apiKey: string): Promise<void> {
  const cleanKey = apiKey.trim();
  await prisma.systemSetting.upsert({
    where: { key: "DEEPSEEK_API_KEY" },
    create: { key: "DEEPSEEK_API_KEY", value: cleanKey, category: "AI" },
    update: { value: cleanKey, category: "AI" },
  });
}

/**
 * Génère une fiche technique officielle via le Moteur IA Hybride Carzone :
 * - Marques Chinoises (Changan, Jetour, BAIC, Haval, Geely, BYD, etc.) -> DeepSeek API (deepseek-chat)
 * - Marques Internationales (Toyota, Mercedes, Land Rover, etc.) -> OpenAI API (gpt-4o / gpt-4o-mini)
 * - Tolérance aux pannes : Fallback croisé automatique entre DeepSeek et OpenAI.
 */
export async function generateTechSheetWithAI(
  vehicle: {
    id?: string;
    brand: string;
    model: string;
    variant?: string | null;
    year?: number | null;
    energy?: string | null;
  },
  customApiKey?: string
): Promise<TechnicalSheet> {
  const normalizedBrand = normalizeBrandName(vehicle.brand);
  const catalogEntry = findCatalogSpecs(vehicle.brand, vehicle.model, vehicle.variant);

  // Filtrer toute variante qui ressemble à une immatriculation béninoise
  const isPlate =
    vehicle.variant && /\b[A-Z]{2}\s*\d{3,4}\s*([A-Z]{2})?\b/i.test(vehicle.variant);
  const cleanVariant = !isPlate ? vehicle.variant || (catalogEntry ? catalogEntry.variant : "") : "";

  const systemPrompt = `Tu es l'ingénieur en chef d'homologation automobile pour la concession CARZONE SARL Bénin (concessionnaire agréé de véhicules 100% neufs).
Tu es directement connecté aux portails techniques et EPC officiels des constructeurs (Changan Global, Jetour Global, BAIC International, BYD Auto, Great Wall Motor, Dongfeng / Forthing, Geely Global, Toyota Global, etc.).

MISSION CRITIQUE :
Générer une fiche technique officielle irréprochable mettant en valeur le véhicule neuf, avec les caractéristiques exactes publiées par le constructeur.

RÈGLES STRICTES :
1. VÉHICULE NEUF SANS PLAQUE : Ne jamais mentionner de plaque d'immatriculation ni de statut d'occasion.
2. CARBURANT RÉEL UNIQUE : "Essence", "Diesel", "100% Électrique" ou "Hybride Rechargeable".
3. TITRE & FINITION : Dénomination commerciale officielle d'origine constructeur (ex: "Premium 1.5T VGT 7DCT", "Summit Reserve 4x4", "Mach Edition 1.5T").
4. MOTORISATION : Caractéristiques officielles : cylindrée exacte en cm3, architecture cylindres, puissance réelle en kW/ch, couple max en Nm, transmission exacte (ex: 7DCT humide, 8AT Aisin, e-CVT).
5. DIMENSIONS : L x l x h en mm, empattement en mm, portes, places, capacité réservoir ou batterie.
6. ÉQUIPEMENTS DE CONFORT : 8 points d'équipements réels (écrans tactiles, volant cuir, sièges massants/ventilés, climatisation bizone, etc.).
7. EXTÉRIEUR & SÉCURITÉ : 8 points extérieurs valorisants et 8 aides à la conduite / sécurité ADAS.
8. LANGUE : 100% en français professionnel automobile de prestige.

Format JSON requis :
{
  "title": string,
  "subtitle": "SPÉCIFICATIONS TECHNIQUES OFFICIELLES CONSTRUCTEUR",
  "brand": string,
  "model": string,
  "variant": string,
  "year": number,
  "energy": string,
  "dimensions": {
    "lengthWidthHeight": string,
    "wheelbase": string,
    "doors": number,
    "seats": number,
    "tankOrBattery": string
  },
  "motorisation": {
    "displacementOrMotor": string,
    "cylinders": string,
    "transmission": string,
    "fuelType": string,
    "maxPower": string,
    "maxTorque": string,
    "rangeKm": string
  },
  "equipementConfort": [8 strings],
  "exterieur": [8 strings],
  "securite": [8 strings]
}`;

  const userPrompt = `Génère la fiche technique officielle constructeur pour :
Marque officielle : ${normalizedBrand}
Modèle exact : ${vehicle.model}
Finition constructeur : ${cleanVariant || "Version d'origine constructeur"}
Année modèle : ${vehicle.year || 2026}
Énergie déclarée : ${vehicle.energy || (catalogEntry ? catalogEntry.energy : "Automatique selon motorisation officielle")}`;

  const deepseekKey = await getDeepSeekApiKey();
  const openaiKey = customApiKey?.trim() || (await getOpenAIApiKey());
  const useDeepSeekFirst = isChineseBrand(normalizedBrand) && !!deepseekKey;

  let parsed: any = null;
  let usedEngine = "CATALOGUE_D_ORIGINE";

  // 1. Appel DeepSeek pour les marques chinoises
  if (useDeepSeekFirst && deepseekKey) {
    try {
      const res = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${deepseekKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const raw = json.choices?.[0]?.message?.content;
        if (raw) {
          parsed = JSON.parse(raw);
          usedEngine = "DEEPSEEK_OFFICIAL_CHINESE_EPC";
        }
      } else {
        console.warn("DeepSeek API status:", res.status, "bascule sur OpenAI...");
      }
    } catch (err) {
      console.warn("Erreur DeepSeek API:", err);
    }
  }

  // 2. Appel OpenAI (pour marques internationales ou fallback DeepSeek)
  if (!parsed && openaiKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const raw = json.choices?.[0]?.message?.content;
        if (raw) {
          parsed = JSON.parse(raw);
          usedEngine = "OPENAI_GPT4O_OFFICIAL";
        }
      } else {
        // Fallback gpt-4o-mini
        const fallbackRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            response_format: { type: "json_object" },
            temperature: 0.2,
          }),
        });
        if (fallbackRes.ok) {
          const json = await fallbackRes.json();
          const raw = json.choices?.[0]?.message?.content;
          if (raw) {
            parsed = JSON.parse(raw);
            usedEngine = "OPENAI_GPT4O_MINI";
          }
        }
      }
    } catch (err) {
      console.warn("Erreur OpenAI API:", err);
    }
  }

  // 3. Appel Vercel AI Gateway (multi-fournisseurs unifié)
  const aiGatewayKey = getAiGatewayApiKey();
  if (!parsed && aiGatewayKey) {
    try {
      const gwRes = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${aiGatewayKey}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
        }),
      });
      if (gwRes.ok) {
        const json = await gwRes.json();
        const raw = json.choices?.[0]?.message?.content;
        if (raw) {
          parsed = JSON.parse(raw);
          usedEngine = "VERCEL_AI_GATEWAY";
        }
      }
    } catch (err) {
      console.warn("Erreur Vercel AI Gateway:", err);
    }
  }

  // 4. Fallback catalogue usine officiel si aucune IA n'a répondu
  if (!parsed) {
    if (catalogEntry) {
      parsed = {
        title: catalogEntry.title,
        subtitle: "SPÉCIFICATIONS TECHNIQUES OFFICIELLES CONSTRUCTEUR",
        brand: catalogEntry.brand,
        model: catalogEntry.model,
        variant: catalogEntry.variant,
        year: catalogEntry.year,
        energy: catalogEntry.energy,
        dimensions: catalogEntry.dimensions,
        motorisation: catalogEntry.motorisation,
        equipementConfort: catalogEntry.equipementConfort,
        exterieur: catalogEntry.exterieur,
        securite: catalogEntry.securite,
      };
      usedEngine = "OFFICIAL_FACTORY_CATALOG";
    } else {
      throw new Error(
        "Impossible de générer la fiche technique : configurez une clé DeepSeek ou OpenAI valide."
      );
    }
  }

  // Association des photographies de studio officielles (zéro plaque civile, format 4:3)
  const officialPhotos = catalogEntry?.photos || {
    mainPhotoUrl: "/images/vehicles/x55-main.jpg",
    interiorPhotoUrl: "/images/vehicles/x55-interior.jpg",
    interiorSeatsPhotoUrl: "/images/vehicles/x55-seats.jpg",
    exteriorPhotoUrl: "/images/vehicles/x55-exterior.jpg",
    rearPhotoUrl: "/images/vehicles/x55-rear.jpg",
  };

  const finalSheet: TechnicalSheet = {
    ...parsed,
    mainPhotoUrl: officialPhotos.mainPhotoUrl,
    interiorPhotoUrl: officialPhotos.interiorPhotoUrl,
    interiorSeatsPhotoUrl: officialPhotos.interiorSeatsPhotoUrl || officialPhotos.interiorPhotoUrl?.replace(".jpg", "-seats.jpg"),
    exteriorPhotoUrl: officialPhotos.exteriorPhotoUrl,
    rearPhotoUrl: officialPhotos.rearPhotoUrl,
    sourceChinese: usedEngine,
    translatedAt: new Date().toISOString(),
  };

  // Sauvegarde automatique en base de données si un identifiant de véhicule est fourni
  if (vehicle.id) {
    try {
      await prisma.vehicle.update({
        where: { id: vehicle.id },
        data: {
          technicalSheetJson: JSON.stringify(finalSheet),
          mainPhotoUrl: finalSheet.mainPhotoUrl,
        },
      });
    } catch (dbErr) {
      console.error("Erreur enregistrement fiche technique en BDD:", dbErr);
    }
  }

  return finalSheet;
}
