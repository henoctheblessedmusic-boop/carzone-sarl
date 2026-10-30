import {
  SITE_ADDRESS,
  SITE_EMAILS,
  SITE_FISCAL,
  SITE_MAPS_URL,
  SITE_PHONES,
  SITE_SOCIAL,
  SITE_WEBSITE,
} from "@/lib/site-constants";

/** Données structurées Schema.org de la concession (facts CLAUDE.md uniquement). */
export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "AutomotiveBusiness",
    name: "CARZONE SARL",
    url: SITE_WEBSITE,
    image: `${SITE_WEBSITE.replace(/\/$/, "")}/images/vehicles/prado-main.jpg`,
    telephone: SITE_PHONES[0],
    email: SITE_EMAILS.contact,
    address: {
      "@type": "PostalAddress",
      streetAddress: `${SITE_ADDRESS.line1}, ${SITE_ADDRESS.line2}`,
      addressLocality: SITE_ADDRESS.city,
      addressCountry: "BJ",
    },
    hasMap: SITE_MAPS_URL,
    sameAs: [SITE_SOCIAL.instagramUrl],
    vatID: SITE_FISCAL.ifu,
    taxID: SITE_FISCAL.ifu,
    description:
      "CARZONE SARL is a multi-brand car dealership in Cotonou, Benin: new vehicle showroom, after-sales workshop and electric charging solutions.",
    areaServed: "Bénin",
  };

  return (
    <script
      type="application/ld+json"
      // Contenu statique contrôlé (aucune entrée utilisateur) : risque XSS nul.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
