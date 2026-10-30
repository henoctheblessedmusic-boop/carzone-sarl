"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { SiteLogo } from "./SiteLogo";
import type { SiteCopy } from "@/lib/i18n/site";
import type { SiteLocale } from "@/lib/site-prefs";

interface SiteHeaderProps {
  locale: SiteLocale;
  copy: SiteCopy;
}

interface NavItem {
  href: string;
  label: string;
}

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), select, [tabindex]:not([tabindex="-1"])';

export function SiteHeader({ locale, copy }: SiteHeaderProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const navItems: NavItem[] = [
    { href: "/", label: copy.nav.home },
    { href: "/vehicules", label: copy.nav.vehicules },
    { href: "/sur-mesure", label: copy.nav.surMesure },
    { href: "/nos-services", label: copy.nav.services },
    { href: "/recharge", label: copy.nav.recharge },
    { href: "/equipe", label: copy.nav.equipe },
    { href: "/contact", label: copy.nav.contact },
  ];

  function closeDrawer(returnFocus: boolean) {
    setIsOpen(false);
    if (returnFocus) toggleRef.current?.focus();
  }

  // Close the drawer whenever the route changes (e.g. a nav link was followed).
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Escape-to-close and a simple focus trap while the drawer is open.
  useEffect(() => {
    if (!isOpen || !drawerRef.current) return;

    const drawerNode = drawerRef.current;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeDrawer(true);
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = drawerNode.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    drawerNode.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <header className="site-header">
      <div className="site-container site-header-inner">
        <SiteLogo />

        <nav className="site-nav-desktop" aria-label={copy.nav.ariaLabel}>
          <ul>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={isActive ? "site-nav-link is-active" : "site-nav-link"}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="site-header-actions">
          <LanguageSwitcher
            locale={locale}
            label={copy.nav.languageLabel}
            className="site-header-actions-lang"
          />
          <Link href="/login" className="site-cta site-cta--ghost site-header-pro-link">
            {copy.nav.proSpace}
          </Link>
          <button
            type="button"
            ref={toggleRef}
            className="site-menu-toggle"
            aria-expanded={isOpen}
            aria-controls="site-mobile-drawer"
            onClick={() => setIsOpen((value) => !value)}
          >
            <span className="site-sr-only">{isOpen ? copy.nav.closeMenu : copy.nav.openMenu}</span>
            {isOpen ? <X aria-hidden="true" size={22} /> : <Menu aria-hidden="true" size={22} />}
          </button>
        </div>
      </div>

      <div
        className={isOpen ? "site-drawer-backdrop is-open" : "site-drawer-backdrop"}
        onClick={() => closeDrawer(false)}
        aria-hidden="true"
      />

      <div
        id="site-mobile-drawer"
        ref={drawerRef}
        className={isOpen ? "site-drawer is-open" : "site-drawer"}
        role="dialog"
        aria-modal="true"
        aria-label={copy.nav.ariaLabel}
      >
        <div className="site-drawer-header">
          <span className="site-drawer-title">CARZONE SARL</span>
          <button type="button" className="site-drawer-close" onClick={() => closeDrawer(true)}>
            <span className="site-sr-only">{copy.nav.closeMenu}</span>
            <X aria-hidden="true" size={22} />
          </button>
        </div>
        <nav aria-label={copy.nav.ariaLabel}>
          <ul className="site-drawer-nav">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={isActive ? "site-nav-link is-active" : "site-nav-link"}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <LanguageSwitcher locale={locale} label={copy.nav.languageLabel} className="site-drawer-lang" />
        <Link href="/login" className="site-cta site-cta--secondary site-drawer-pro-link">
          {copy.nav.proSpace}
        </Link>
      </div>
    </header>
  );
}
