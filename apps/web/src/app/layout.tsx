import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { AppPrefs, resolvePrefs, THEME_BOOT_SCRIPT } from "@/components/RootPrefs";
import { getServerMessages } from "@/lib/i18n/server";
import { isSiteLocale } from "@/lib/site-prefs";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { NetworkStatusBanner } from "@/components/NetworkStatusBanner";
import { AndroidBackGuard } from "@/components/AndroidBackGuard";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0B0F19",
};

export async function generateMetadata(): Promise<Metadata> {
  const { messages } = await getServerMessages();
  return {
    title: messages.meta.title,
    description: messages.meta.description,
    applicationName: "CARZONE",
    manifest: "/manifest.webmanifest",
    icons: {
      icon: "/icons/icon-192.png",
      apple: "/icons/apple-touch-icon.png",
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, theme, localeFromCookie } = await resolvePrefs();
  const requestHeaders = await headers();
  const siteLocale = requestHeaders.get("x-site-locale");
  // La vitrine publique (4 langues) pilote sa propre locale ; l'app interne garde la sienne.
  const htmlLang = isSiteLocale(siteLocale) ? siteLocale : locale;

  return (
    <html
      lang={htmlLang}
      data-theme={theme}
      data-theme-pref={theme}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body>
        <AppPrefs locale={locale} theme={theme} persistLocaleCookie={!localeFromCookie}>
          {children}
        </AppPrefs>
        <ServiceWorkerRegister />
        <NetworkStatusBanner />
        <AndroidBackGuard />
      </body>
    </html>
  );
}
