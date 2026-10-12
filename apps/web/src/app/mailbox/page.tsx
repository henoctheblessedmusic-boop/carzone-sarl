import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { MailboxView } from "./MailboxView";

export default async function MailboxPage() {
  const user = await requireUser();

  const [mails, customers] = await Promise.all([
    prisma.mailMessage.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: {
          select: { id: true, contactName: true, email: true },
        },
      },
    }),
    prisma.customer.findMany({
      select: { id: true, contactName: true, companyName: true, email: true },
      orderBy: { contactName: "asc" },
    }),
  ]);

  return (
    <AppShell user={user} title="Boîte de réception & messagerie">
      <MailboxView
        initialMails={mails}
        customers={customers}
        currentUserEmail={user.email}
      />
    </AppShell>
  );
}
