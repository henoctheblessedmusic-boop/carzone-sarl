import type { ReactNode } from "react";
import { SITE_SOCIAL, type SiteSocialNetwork } from "@/lib/site-constants";

const ICON_PATHS: Record<SiteSocialNetwork, ReactNode> = {
  facebook: (
    <path
      fill="currentColor"
      d="M13.5 21v-7.5h2.52l.42-3H13.5V8.55c0-.87.24-1.46 1.49-1.46h1.58V4.41c-.27-.04-1.2-.12-2.29-.12-2.27 0-3.82 1.38-3.82 3.92V10.5H8v3h2.46V21h3.04Z"
    />
  ),
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.9" />
      <circle cx="12" cy="12" r="4.1" fill="none" stroke="currentColor" strokeWidth="1.9" />
      <circle cx="17.5" cy="6.5" r="1.15" fill="currentColor" />
    </>
  ),
  tiktok: (
    <path
      fill="currentColor"
      d="M16.7 3c.23 1.98 1.35 3.26 3.3 3.47v2.9c-1.14.1-2.14-.22-3.16-.9v5.63c0 3.47-2.42 5.9-5.78 5.9-3.17 0-5.56-2.13-5.56-5.2 0-3.3 2.7-5.47 5.94-5.1v3.02c-.47-.12-.92-.17-1.35-.08-1.2.24-2.02 1.16-1.96 2.37.05 1.2.94 2.15 2.16 2.2 1.27.05 2.35-.86 2.35-2.22V3h4.06Z"
    />
  ),
  youtube: (
    <>
      <rect x="2.8" y="5.5" width="18.4" height="13" rx="4" fill="currentColor" />
      <path d="M10.2 9.4v5.2l4.6-2.6-4.6-2.6Z" fill="#0B0F19" />
    </>
  ),
};

const NETWORK_ORDER: SiteSocialNetwork[] = ["facebook", "instagram", "tiktok", "youtube"];

export function SiteSocialLinks() {
  return (
    <div className="site-footer-socials" aria-label="Réseaux sociaux CARZONE">
      {NETWORK_ORDER.map((network) => {
        const social = SITE_SOCIAL[network];
        const content = (
          <>
            <span className="site-social-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" role="presentation">
                {ICON_PATHS[network]}
              </svg>
            </span>
            <span className="site-social-label">{social.label}</span>
          </>
        );

        if (!social.url) {
          return (
            <span
              key={network}
              className="site-footer-social-link is-disabled"
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
            className="site-footer-social-link"
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
