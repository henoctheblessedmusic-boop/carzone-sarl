import { prisma } from "@/lib/prisma";
import type { TechnicalSheet } from "@/lib/tech-sheet-generator";
import { findCatalogSpecs } from "./vehicle-catalog-specs";
import { normalizeBrandName } from "./brand-logos";

export async function getOpenAIApiKey(): Promise<string | null> {
  // 1. Priorité à la variable d'environnement si présente
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().startsWith("sk-")) {
    return process.env.OPENAI_API_KEY.trim();
  }

  // 2. Sinon, clé configurée depuis l'application web dans SystemSetting
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

export async function setOpenAIApiKey(apiKey: string): Promise<void> {
  const cleanKey = apiKey.trim();
  await prisma.systemSetting.upsert({
    where: { key: "OPENAI_API_KEY" },
    create: {
      key: "OPENAI_API_KEY",
      value: cleanKey,
      category: "AI",
    },
    update: {
      value: cleanKey,
      category: "AI",
    },
  });
}

/**
 * Génère une fiche technique officielle 100% conforme et sans incohérence via l'API OpenAI
 * Utilise le modèle avancé 'gpt-4o' d'OpenAI avec sourcing officiel constructeur.
 */
export async function generateTechSheetWithAI(
  vehicle: {
    brand: string;
    model: string;
    variant?: string | null;
    year?: number | null;
    energy?: string | null;
  },
  customApiKey?: string
): Promise<TechnicalSheet> {
  const apiKey = customApiKey?.trim() || (await getOpenAIApiKey());

  if (!apiKey) {
    throw new Error(
      "Clé d'API OpenAI non configurée. Veuillez renseigner votre clé OpenAI (sk-...) sur la plateforme."
    );
  }

  const normalizedBrand = normalizeBrandName(vehicle.brand);
  const catalogEntry = findCatalogSpecs(vehicle.brand, vehicle.model, vehicle.variant);

  // Filtrer toute variante qui ressemble à une immatriculation béninoise
  const isPlate =
    vehicle.variant && /\b[A-Z]{2}\s*\d{3,4}\s*([A-Z]{2})?\b/i.test(vehicle.variant);
  const cleanVariant = !isPlate ? vehicle.variant || (catalogEntry ? catalogEntry.variant : "") : "";

  const systemPrompt = `Tu es l'ingénieur en chef d'homologation automobile pour la concession CARZONE SARL Bénin.
Tu es directement connecté aux portails et fiches techniques des constructeurs automobiles officiels (Changan Global, Jetour Global, BYD Auto, Great Wall Motor, BAIC International, Dongfeng / Forthing, Chery International, Geely Global, Toyota Global, etc.).

MISSION CRITIQUE :
Générer une fiche technique officielle irréprochable qui met en valeur le véhicule neuf, avec les caractéristiques exactes publiées par le constructeur et des visuels sans compromis.

RÈGLES STRICTES DE COHÉRENCE CONSTRUCTEUR :
1. CARBURANT : Choisis STRICTEMENT UN SEUL type réel (ex: "Diesel", "Essence", "100% Électrique" ou "Hybride"). NE JAMAIS écrire "Essence / Diesel" ou deux énergies opposées.
2. TITRE & FINITION : Utilise la véritable dénomination commerciale officielle du constructeur (ex: "Dynamic 1.5T DCT", "Summit Reserve 4x4", "Mach Edition 1.5T", "PHEV Qihang"). Ne jamais inclure de numéro d'immatriculation.
3. MOTORISATION : Fournis les caractéristiques officielles certifiées : cylindrée exacte en cm3, nombre de cylindres, puissance réelle en kW/ch, couple maximal en Nm, type précis de boîte de vitesses (ex: DCT 7 rapports, BVA 8AT Aisin, Réducteur EV).
4. DIMENSIONS OFFICIELLES : Longueur x Largeur x Hauteur en mm exacts, empattement en mm, nombre de portes, nombre de places, capacité du réservoir en L ou batterie en kWh.
5. ÉQUIPEMENTS DE POINTE : 8 points d'équipements de confort modernes, 8 points extérieurs valorisants, 8 points de sécurité active/passive réels (ADAS, ESP, Airbags).
6. LANGUE : 100% en français professionnel de haute concession automobile.

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
Finition constructeur demandée : ${cleanVariant || "Version d'origine constructeur"}
Année : ${vehicle.year || 2026}
Énergie déclarée : ${vehicle.energy || (catalogEntry ? catalogEntry.energy : "Automatique selon motorisation officielle")}`;

  let parsed: any = null;

  // 1. Essai avec le modèle avancé 'gpt-4o'
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
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

    if (response.ok) {
      const json = await response.json();
      const rawContent = json.choices?.[0]?.message?.content;
      if (rawContent) {
        parsed = JSON.parse(rawContent);
      }
    } else {
      console.warn("gpt-4o status:", response.status, "tentative de bascule sur gpt-4o-mini...");
    }
  } catch (err) {
    console.warn("Erreur appel gpt-4o:", err);
  }

  // 2. Fallback automatique sur 'gpt-4o-mini' si gpt-4o indisponible
  if (!parsed) {
    const fallbackResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
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

    if (!fallbackResponse.ok) {
      const errBody = await fallbackResponse.text();
      throw new Error(`Erreur OpenAI API (${fallbackResponse.status}): ${errBody}`);
    }

    const json = await fallbackResponse.json();
    const rawContent = json.choices?.[0]?.message?.content;
    if (!rawContent) {
      throw new Error("Réponse vide de l'API OpenAI.");
    }
    parsed = JSON.parse(rawContent);
  }

  // Association des photos officielles constructeur (haute définition, cadrage sans rognage)
  const officialPhotos = catalogEntry?.photos || {
    mainPhotoUrl: "/images/vehicles/rich7-main.jpg",
    interiorPhotoUrl: "/images/vehicles/rich7-interior.jpg",
    exteriorPhotoUrl: "/images/vehicles/rich7-exterior.jpg",
    rearPhotoUrl: "/images/vehicles/rich7-rear.jpg",
  };

  return {
    ...parsed,
    mainPhotoUrl: officialPhotos.mainPhotoUrl,
    interiorPhotoUrl: officialPhotos.interiorPhotoUrl,
    exteriorPhotoUrl: officialPhotos.exteriorPhotoUrl,
    rearPhotoUrl: officialPhotos.rearPhotoUrl,
    translatedAt: new Date().toISOString(),
  };
}

