import type { Metadata } from "next";
import { Container } from "@/components/site/Container";
import { SITE_ADDRESS, SITE_EMAILS, SITE_FISCAL, SITE_PHONES, SITE_WEBSITE } from "@/lib/site-constants";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_WEBSITE),
  title: "Mentions légales | CARZONE SARL",
  description:
    "Mentions légales du site CARZONE SARL : éditeur, hébergeur, propriété intellectuelle, données personnelles et droit applicable.",
  alternates: { canonical: "/mentions-legales" },
  openGraph: {
    title: "Mentions légales | CARZONE SARL",
    description: "Informations légales relatives au site de CARZONE SARL.",
    url: "/mentions-legales",
    siteName: "CARZONE SARL",
    type: "website",
  },
};

export default function MentionsLegalesPage() {
  return (
    <>
      <section className="site-page-hero site-page-hero--compact">
        <Container>
          <p className="site-eyebrow">Informations légales</p>
          <h1 className="site-page-title">Mentions légales</h1>
          <p className="site-page-subtitle">
            Identification de l'éditeur, hébergement, propriété intellectuelle et conditions d'utilisation du site.
          </p>
        </Container>
      </section>

      <section className="site-section site-section--tight-top">
        <Container>
          <article className="site-legal">
            <h2>1. Éditeur du site</h2>
            <p>
              <strong>CARZONE SARL</strong>, concessionnaire automobile multimarques.
              <br />
              Showroom : {SITE_ADDRESS.line1}, {SITE_ADDRESS.line2}, {SITE_ADDRESS.city}, {SITE_ADDRESS.country}.
              <br />
              Téléphones : {SITE_PHONES.join(" · ")}.
              <br />
              E-mail : <a href={`mailto:${SITE_EMAILS.contact}`}>{SITE_EMAILS.contact}</a>.
              <br />
              IFU : {SITE_FISCAL.ifu} · RCCM : {SITE_FISCAL.rccm}.
            </p>

            <h2>2. Directeur de la publication</h2>
            <p>La Direction de CARZONE SARL.</p>

            <h2>3. Hébergement</h2>
            <p>
              Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis
              (<a href="https://vercel.com" target="_blank" rel="noopener noreferrer">vercel.com</a>).
              La base de données est hébergée par Neon Inc.
            </p>

            <h2>4. Propriété intellectuelle</h2>
            <p>
              L'ensemble des contenus du site (textes, structure, éléments graphiques, marque CARZONE) est protégé par
              le droit de la propriété intellectuelle. Les visuels de véhicules sont des documents constructeurs
              utilisés à titre illustratif ; les marques et modèles cités appartiennent à leurs titulaires respectifs.
              Toute reproduction ou représentation, totale ou partielle, sans autorisation écrite préalable de CARZONE
              SARL est interdite.
            </p>

            <h2>5. Informations sur les véhicules</h2>
            <p>
              Les informations présentées sur le site (modèles, motorisations, photographies, descriptifs) sont
              fournies à titre indicatif et peuvent évoluer selon les arrivages et les conditions du constructeur.
              Les prix ne sont pas affichés en ligne : chaque cotation est établie sur demande auprès de notre équipe
              commerciale. Les photographies n'ont pas de valeur contractuelle.
            </p>

            <h2>6. Données personnelles</h2>
            <p>
              Le traitement des données personnelles collectées via le site est décrit dans notre{" "}
              <a href="/confidentialite">politique de confidentialité</a>.
            </p>

            <h2>7. Responsabilité</h2>
            <p>
              CARZONE SARL s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site,
              sans pouvoir garantir l'absence totale d'erreurs. Le site peut contenir des liens vers des sites tiers
              dont le contenu n'est pas sous le contrôle de CARZONE SARL.
            </p>

            <h2>8. Droit applicable</h2>
            <p>
              Le présent site et ses conditions d'utilisation sont soumis au droit béninois. Tout litige relatif à
              l'utilisation du site relève de la compétence des juridictions de Cotonou, sous réserve des règles
              impératives applicables.
            </p>
          </article>
        </Container>
      </section>
    </>
  );
}
