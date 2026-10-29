import { Metadata } from "next";
import { PresentationClient } from "./PresentationClient";
import { getServerMessages } from "@/lib/i18n/server";
import { presentationCopy } from "@/lib/i18n/messages/presentation";

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerMessages();
  const copy = presentationCopy[locale];
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
  };
}

export default function PresentationPage() {
  return <PresentationClient />;
}
