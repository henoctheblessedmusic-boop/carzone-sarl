import { NextResponse } from "next/server";
import { getOpenAIApiKey, setOpenAIApiKey } from "@/lib/openai-tech-sheet";
import { getSession } from "@/lib/auth";

const ALLOWED_CONFIG_ROLES = ["PDG", "DG", "ADMIN", "ADV", "RTA", "DEVELOPER", "SG"];

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const key = await getOpenAIApiKey();
  if (!key) {
    return NextResponse.json({ configured: false });
  }
  const masked = `${key.slice(0, 6)}...${key.slice(-4)}`;
  return NextResponse.json({ configured: true, maskedKey: masked });
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    if (!ALLOWED_CONFIG_ROLES.includes(session.role)) {
      return NextResponse.json({ error: "Accès refusé pour votre rôle" }, { status: 403 });
    }
    const body = await req.json();
    const apiKey = (body.apiKey || "").trim();

    if (!apiKey) {
      return NextResponse.json({ error: "La clé API ne peut pas être vide" }, { status: 400 });
    }

    if (!apiKey.startsWith("sk-")) {
      return NextResponse.json(
        { error: "Format de clé invalide. Une clé OpenAI commence par 'sk-'" },
        { status: 400 }
      );
    }

    // Tester la clé avec un appel minimal
    const testRes = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!testRes.ok) {
      return NextResponse.json(
        { error: "Clé OpenAI rejetée par l'API OpenAI (authentification échouée)" },
        { status: 400 }
      );
    }

    await setOpenAIApiKey(apiKey);

    return NextResponse.json({
      success: true,
      message: "Clé OpenAI enregistrée et vérifiée avec succès.",
      maskedKey: `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}`,
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error)?.message || "Erreur" }, { status: 500 });
  }
}
