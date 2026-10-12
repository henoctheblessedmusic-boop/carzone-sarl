import { NextResponse } from "next/server";
import { getOpenAIApiKey, setOpenAIApiKey } from "@/lib/openai-tech-sheet";
import { requireUser } from "@/lib/require-user";

export async function GET() {
  try {
    await requireUser();
    const key = await getOpenAIApiKey();
    if (!key) {
      return NextResponse.json({ configured: false });
    }
    const masked = `${key.slice(0, 6)}...${key.slice(-4)}`;
    return NextResponse.json({ configured: true, maskedKey: masked });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser(["PDG", "DG", "ADMIN", "ADV", "RTA"]);
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
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur" }, { status: 500 });
  }
}
