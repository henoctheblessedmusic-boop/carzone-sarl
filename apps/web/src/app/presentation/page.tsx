import { Metadata } from "next";
import { PresentationClient } from "./PresentationClient";

export const metadata: Metadata = {
  title: "Présentation Motion Design 16:9 & Mobile — CARZONE SARL Ops",
  description:
    "Présentation dynamique et motion design du progiciel de concession automobile CARZONE SARL : finances réelles, fiches techniques IA immuables, atelier SAV, VoIP et mobile checking en temps réel.",
};

export default function PresentationPage() {
  return <PresentationClient />;
}
