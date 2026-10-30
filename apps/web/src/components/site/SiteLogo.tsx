import Link from "next/link";

export function SiteLogo() {
  return (
    <Link href="/" className="site-logo" aria-label="CARZONE SARL — Concessionnaire automobile multimarques">
      <svg className="site-logo-mark" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="site-logo-ring" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
        </defs>
        <circle cx="24" cy="24" r="22" fill="#0b0f19" stroke="url(#site-logo-ring)" strokeWidth="2" />
        <circle cx="24" cy="24" r="18" fill="none" stroke="#e11d48" strokeWidth="1" opacity="0.4" />
        <text
          x="24"
          y="32"
          textAnchor="middle"
          fontFamily="'Segoe UI', Arial, sans-serif"
          fontWeight="800"
          fontSize="22"
          fill="url(#site-logo-ring)"
        >
          Z
        </text>
      </svg>
      <span className="site-logo-text">
        <span className="site-logo-word">
          CAR<span className="site-logo-word-accent">ZONE</span>
        </span>
        <span className="site-logo-tagline">Drive your dream</span>
      </span>
    </Link>
  );
}
