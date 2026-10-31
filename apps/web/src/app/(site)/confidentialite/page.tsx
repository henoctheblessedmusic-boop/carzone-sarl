import type { Metadata } from "next";
import { Container } from "@/components/site/Container";
import { SITE_WEBSITE } from "@/lib/site-constants";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_WEBSITE),
  title: "Politique de confidentialité | CARZONE SARL",
  description:
    "Politique de confidentialité de CARZONE SARL : données collectées via les demandes de cotation, finalités, durée de conservation et droits des personnes.",
  alternates: { canonical: "/confidentialite" },
  openGraph: {
    title: "Politique de confidentialité | CARZONE SARL",
    description: "Comment CARZONE SARL collecte et protège vos données personnelles.",
    url: "/confidentialite",
    siteName: "CARZONE SARL",
    images: [{ url: "/brand/carzone-og.png", width: 1200, height: 630, alt: "CARZONE SARL" }],
    type: "website",
  },
  twitter: { card: "summary_large_image", images: ["/brand/carzone-og.png"] },
};

const LAST_UPDATED = "31 octobre 2026";

export default function ConfidentialitePage() {
  return (
    <>
      <section className="site-page-hero site-page-hero--compact">
        <Container>
          <p className="site-eyebrow">Informations légales</p>
          <h1 className="site-page-title">Politique de confidentialité</h1>
          <p className="site-page-subtitle">
            Comment CARZONE SARL collecte, utilise et protège les données personnelles transmises via ce site.
          </p>
        </Container>
      </section>

      <section className="site-section site-section--tight-top">
        <Container>
          <article className="site-legal">
            <p className="site-legal-updated">Dernière mise à jour : {LAST_UPDATED}</p>

            <h2>1. Responsable du traitement</h2>
            <p>
              Le responsable du traitement des données personnelles collectées sur ce site est <strong>CARZONE
              SARL</strong>, concessionnaire automobile multimarques, dont le showroom est situé Zone
              Maro-Militaire, Quartier Gbèdomidji, Cotonou, Bénin.
            </p>
            <p>
              Pour toute question relative à vos données : <a href="mailto:contact@topcarzone.com">contact@topcarzone.com</a>{" "}
              ou +229 01 92 61 61 61.
            </p>

            <h2>2. Données collectées</h2>
            <p>Lorsque vous utilisez le formulaire de demande de cotation, nous collectons :</p>
            <ul>
              <li>votre nom ;</li>
              <li>votre numéro de téléphone et/ou votre adresse e-mail ;</li>
              <li>le véhicule qui vous intéresse ;</li>
              <li>le message que vous nous adressez.</li>
            </ul>
            <p>
              Lorsque vous nous contactez par WhatsApp ou par e-mail, nous recevons les informations que vous
              choisissez de nous transmettre. Le site mesure également sa fréquentation de façon agrégée et sans
              cookie publicitaire (pages consultées, type d'appareil).
            </p>

            <h2>3. Finalités et base légale</h2>
            <p>Vos données sont utilisées uniquement pour :</p>
            <ul>
              <li>répondre à votre demande de cotation et vous recontacter ;</li>
              <li>vous adresser une proposition commerciale adaptée au véhicule demandé ;</li>
              <li>améliorer le contenu et le fonctionnement du site.</li>
            </ul>
            <p>
              Le traitement repose sur votre <strong>consentement</strong>, exprimé lors de l'envoi du formulaire, et sur
              l'intérêt légitime de CARZONE SARL à répondre aux demandes commerciales qui lui sont adressées.
            </p>

            <h2>4. Destinataires des données</h2>
            <p>
              Vos données sont accessibles à l'équipe commerciale de CARZONE SARL, dans la limite de ce qui est
              nécessaire au traitement de votre demande. Elles ne sont ni vendues ni cédées à des tiers à des fins
              publicitaires.
            </p>
            <p>
              Le site est hébergé par Vercel Inc. et sa base de données par Neon Inc., prestataires techniques agissant
              sur instruction de CARZONE SARL et présentant des garanties de sécurité appropriées.
            </p>

            <h2>5. Durée de conservation</h2>
            <p>
              Les demandes de cotation sont conservées pendant <strong>trente-six (36) mois</strong> à compter du
              dernier contact, sauf obligation légale contraire. À l'issue de cette période, elles sont supprimées ou
              anonymisées.
            </p>

            <h2>6. Vos droits</h2>
            <p>
              Conformément au Code du numérique de la République du Bénin, vous disposez d'un droit d'accès, de
              rectification, d'effacement, d'opposition et de portabilité de vos données. Pour exercer ces droits,
              écrivez à <a href="mailto:contact@topcarzone.com">contact@topcarzone.com</a> en précisant votre demande.
              Vous pouvez également introduire une réclamation auprès de l'Autorité de protection des données
              personnelles (APDP) du Bénin.
            </p>

            <h2>7. Cookies et mesure d'audience</h2>
            <p>
              Le site n'utilise aucun cookie publicitaire ni traceur de réseaux sociaux. Un cookie strictement
              nécessaire mémorise votre langue d'affichage, et la mesure d'audience est réalisée de manière agrégée,
              sans cookie de suivi individuel.
            </p>

            <h2>8. Sécurité</h2>
            <p>
              Les échanges avec le site sont chiffrés (HTTPS). L'accès aux demandes de cotation est restreint aux
              collaborateurs habilités, et nos formulaires sont protégés contre les envois automatisés abusifs.
            </p>

            <h2>9. Modification de la présente politique</h2>
            <p>
              Cette politique peut être mise à jour pour tenir compte de l'évolution de nos services ou de la
              réglementation. La date de dernière mise à jour figure en haut de cette page.
            </p>
          </article>
        </Container>
      </section>
    </>
  );
}
