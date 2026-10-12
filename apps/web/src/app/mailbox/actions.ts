"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";

export async function sendEmail(formData: FormData) {
  const user = await requireUser();

  const to = String(formData.get("to") || "").trim();
  const subject = String(formData.get("subject") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const customerId = String(formData.get("customerId") || "") || null;
  const quoteId = String(formData.get("quoteId") || "") || null;
  const invoiceId = String(formData.get("invoiceId") || "") || null;

  if (!to || !subject || !body) {
    throw new Error("Destinataire, objet et message requis");
  }

  const snippet = body.slice(0, 100).replace(/\n/g, " ");

  await prisma.mailMessage.create({
    data: {
      folder: "SENT",
      from: user.email || "contact@topcarzone.com",
      to,
      subject,
      snippet,
      body,
      isRead: true,
      customerId,
      quoteId,
      invoiceId,
    },
  });

  revalidatePath("/mailbox");
}

export async function markMailRead(id: string, isRead: boolean) {
  await requireUser();

  await prisma.mailMessage.update({
    where: { id },
    data: { isRead },
  });

  revalidatePath("/mailbox");
}

export async function toggleMailStar(id: string, starred: boolean) {
  await requireUser();

  await prisma.mailMessage.update({
    where: { id },
    data: { starred },
  });

  revalidatePath("/mailbox");
}

export async function deleteMail(id: string) {
  await requireUser();

  const msg = await prisma.mailMessage.findUnique({ where: { id } });
  if (!msg) return;

  if (msg.folder === "TRASH") {
    await prisma.mailMessage.delete({ where: { id } });
  } else {
    await prisma.mailMessage.update({
      where: { id },
      data: { folder: "TRASH" },
    });
  }

  revalidatePath("/mailbox");
}
