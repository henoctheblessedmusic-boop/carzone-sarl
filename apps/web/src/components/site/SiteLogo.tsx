import Image from "next/image";
import Link from "next/link";

/**
 * En-tête CARZONE : logo officiel complet à gauche (emblème + lettrage, jamais
 * rogné), puis CARZONE en grand et « Drive your dream » en dessous.
 */
export function SiteLogo() {
  return (
    <Link href="/" className="site-logo" aria-label="CARZONE SARL — Concessionnaire automobile multimarques">
      <Image
        src="/brand/carzone-logo.png"
        alt="CARZONE SARL"
        width={80}
        height={57}
        priority
        className="site-logo-emblem"
      />
      <span className="site-logo-lockup">
        <span className="site-logo-word">CARZONE</span>
        <span className="site-logo-tagline">Drive your dream</span>
      </span>
    </Link>
  );
}
