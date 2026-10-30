import Link from "next/link";
import type { ReactNode } from "react";

interface CtaLinkProps {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  external?: boolean;
}

export function CtaLink({ href, children, variant = "primary", external = false }: CtaLinkProps) {
  const className = `site-cta site-cta--${variant}`;

  if (external) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
