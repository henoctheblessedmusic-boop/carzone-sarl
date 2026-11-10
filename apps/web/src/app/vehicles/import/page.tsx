import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/require-user";
import { StockImportView } from "./StockImportView";

export default async function StockImportPage() {
  const user = await requireUser();
  if (!["DEVELOPER", "PDG"].includes(user.role)) redirect("/dashboard");

  return (
    <AppShell user={user} title="Import stock Excel">
      <StockImportView />
    </AppShell>
  );
}
