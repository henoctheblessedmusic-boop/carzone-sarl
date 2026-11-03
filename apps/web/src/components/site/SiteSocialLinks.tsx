import { SITE_SOCIAL, type SiteSocialNetwork } from "@/lib/site-constants";
import { SiteSocialIcon } from "./SiteSocialIcon";

const NETWORK_ORDER: SiteSocialNetwork[] = ["facebook", "instagram", "tiktok", "youtube"];

export function SiteSocialLinks() {
  return (
    <div className="site-footer-socials" aria-label="Réseaux sociaux CARZONE">
      {NETWORK_ORDER.map((network) => {
        const social = SITE_SOCIAL[network];
        const content = (
          <>
            <span className="site-social-icon" aria-hidden="true">
              <SiteSocialIcon network={network} size={18} />
            </span>
            <span className="site-social-label">{social.label}</span>
          </>
        );

        if (!social.url) {
          return (
            <span
              key={network}
              className={`site-footer-social-link site-footer-social-link--${network} is-disabled`}
              title={`${social.label} - bientôt disponible`}
              aria-label={`${social.label} - bientôt disponible`}
              aria-disabled="true"
            >
              {content}
            </span>
          );
        }

        return (
          <a
            key={network}
            className={`site-footer-social-link site-footer-social-link--${network}`}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            title={`${social.label} ${social.handle}`}
            aria-label={`${social.label} ${social.handle}`}
          >
            {content}
          </a>
        );
      })}
    </div>
  );
}
