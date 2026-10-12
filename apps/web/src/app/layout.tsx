import type { Metadata } from "next";
import "./globals.css";
import { AppPrefs, resolvePrefs, THEME_BOOT_SCRIPT } from "@/components/RootPrefs";

export const metadata: Metadata = {
  title: "CARZONE SARL — Concessionnaire Automobile & Mobilité Cotonou",
  description: "ERP / DMS de gestion de concession automobile, showroom véhicules neufs multimarques, atelier SAV & bornes — CARZONE SARL (Cotonou, Bénin)",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, theme, localeFromCookie } = await resolvePrefs();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body>
        <AppPrefs locale={locale} theme={theme} persistLocaleCookie={!localeFromCookie}>
          {children}
        </AppPrefs>
      </body>
    </html>
  );
}
