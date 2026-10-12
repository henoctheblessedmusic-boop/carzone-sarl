import { prisma } from "@/lib/prisma";
import type { TechnicalSheet } from "@/lib/tech-sheet-generator";

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

  // Filtrer toute variante qui ressemble à une immatriculation béninoise
  const isPlate =
    vehicle.variant && /\b[A-Z]{2}\s*\d{3,4}\s*([A-Z]{2})?\b/i.test(vehicle.variant);
  const cleanVariant = !isPlate ? vehicle.variant || "" : "";

  const systemPrompt = `Tu es un ingénieur expert homologation automobile et fiches techniques certifiées constructeurs pour la concession CARZONE SARL Bénin.
Ta mission est de générer les spécifications techniques officielles et exactes d'un véhicule neuf en stock.

RÈGLES STRICTES DE COHÉRENCE :
1. CARBURANT : Choisis STRICTEMENT UN SEUL type réel (ex: "Diesel", "Essence", "100% Électrique" ou "Hybride"). NE JAMAIS écrire "Essence / Diesel" ou deux énergies opposées.
2. TITRE & FINITION : N'invente jamais de plaque d'immatriculation. Utilise la vraie finition constructeur (ex: "Custom Trend 2.0L EcoBlue", "Summit Reserve 4x4", etc.).
3. MOTORISATION : Fournis les caractéristiques officielles exactes : cylindrée en cm3, nombre de cylindres, puissance en kW/ch, couple en Nm, boîte de vitesses.
4. DIMENSIONS : Longueur x Largeur x Hauteur en mm, empattement en mm, nombre de portes, nombre de places, réservoir en L ou batterie en kWh.
5. ÉQUIPEMENTS : 8 points d'équipements de confort, 8 points extérieurs, 8 points de sécurité réels et modernes pour cette année/génération.
6. LANGUE : 100% en français professionnel.

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
    "lengthWidthHeight": string (ex: "5340x1920x1890"),
    "wheelbase": string (ex: "3100"),
    "doors": number,
    "seats": number,
    "tankOrBattery": string (ex: "70L" ou "65 kWh")
  },
  "motorisation": {
    "displacementOrMotor": string,
    "cylinders": string,
    "transmission": string,
    "fuelType": string,
    "maxPower": string,
    "maxTorque": string,
    "rangeKm": string (optionnel pour électrique)
  },
  "equipementConfort": [8 strings],
  "exterieur": [8 strings],
  "securite": [8 strings]
}`;

  const userPrompt = `Génère la fiche technique officielle constructeur pour :
Marque : ${vehicle.brand}
Modèle : ${vehicle.model}
Finition demandée : ${cleanVariant || "Version d'origine constructeur"}
Année : ${vehicle.year || 2024}
Énergie déclarée : ${vehicle.energy || "Automatique selon motorisation officielle"}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
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

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Erreur OpenAI API (${response.status}): ${errBody}`);
  }

  const json = await response.json();
  const rawContent = json.choices?.[0]?.message?.content;
  if (!rawContent) {
    throw new Error("Réponse vide de l'API OpenAI.");
  }

  const parsed = JSON.parse(rawContent);

  return {
    ...parsed,
    translatedAt: new Date().toISOString(),
  };
}
