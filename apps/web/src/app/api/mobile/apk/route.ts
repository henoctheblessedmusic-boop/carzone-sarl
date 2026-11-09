import path from "node:path";
import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/api-auth";
import { logAudit } from "@/lib/audit";
import { MOBILE_APP } from "@/lib/mobile-app";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const filePath = path.join(process.cwd(), MOBILE_APP.relativePath);

  try {
    const file = await readFile(filePath);

    await logAudit({
      user,
      action: "mobile.apk_download",
      entityType: "MobileApp",
      entityId: MOBILE_APP.version,
      entityLabel: MOBILE_APP.fileName,
      details: `Téléchargement de l'APK mobile ${MOBILE_APP.version}`,
    });

    return new NextResponse(new Uint8Array(file), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.android.package-archive",
        "Content-Disposition": `attachment; filename="${MOBILE_APP.fileName}"`,
        "Content-Length": String(file.byteLength),
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "APK indisponible" }, { status: 404 });
  }
}
