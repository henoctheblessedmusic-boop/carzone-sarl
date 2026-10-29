"use client";

import { useState, useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, MessageSquare, HelpCircle } from "lucide-react";
import { CarzoneLogo } from "@/components/CarzoneLogo";
import { StickyNav } from "@/components/StickyNav";
import { PrefsControls } from "@/components/PrefsControls";
import { OnboardingHost } from "@/components/OnboardingHost";
import { HelpCenterModal } from "@/components/HelpCenterModal";
import { AdminNotificationsBell } from "@/components/AdminNotificationsBell";
import { ChangePasswordModal } from "@/components/ChangePasswordModal";
import { DevicePermissionsSetup } from "@/components/DevicePermissionsSetup";
import { GlobalCallManager } from "@/components/GlobalCallManager";
import type { SessionUser } from "@/lib/auth";

type NavItem = {
  href: string;
  label: string;
  roles: string[] | null;
};

export function AppShellClient({
  user,
  items,
  heading,
  roleLabel,
  tagline,
  logoutLabel,
  logoutTitle,
  navAria,
  helpButton,
  helpTitle,
  helpAria,
  children,
}: {
  user: SessionUser;
  items: NavItem[];
  heading: string;
  roleLabel: string;
  tagline: string;
  logoutLabel: string;
  logoutTitle: string;
  navAria: string;
  helpButton: string;
  helpTitle: string;
  helpAria: string;
  children: ReactNode;
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsDrawerOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Lock body scroll on small screens when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  const [unreadChatCount, setUnreadChatCount] = useState(0);

  useEffect(() => {
    const handleUnread = (e: Event) => {
      const custom = e as CustomEvent<{ unreadCount: number }>;
      if (custom.detail && typeof custom.detail.unreadCount === "number") {
        setUnreadChatCount(custom.detail.unreadCount);
      }
    };
    window.addEventListener("carzone:unread_chat", handleUnread);
    return () => window.removeEventListener("carzone:unread_chat", handleUnread);
  }, []);

  return (
    <div className="ox-layout">
      {/* Mobile Drawer Backdrop */}
      <div
        className={`ox-drawer-backdrop${isDrawerOpen ? " is-open" : ""}`}
        onClick={() => setIsDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar Navigation */}
      <aside className={`ox-aside${isDrawerOpen ? " is-open" : ""}`}>
        <div className="ox-aside-header">
          <div className="ox-brand">
            <CarzoneLogo size="sm" />
            <div style={{ fontSize: "0.75rem", opacity: 0.65, paddingLeft: 2 }}>
              {tagline}
            </div>
          </div>
          <button
            type="button"
            className="ox-aside-close-btn"
            onClick={() => setIsDrawerOpen(false)}
            aria-label="Fermer le menu"
          >
            <X size={18} />
          </button>
        </div>

        <StickyNav
          items={items}
          ariaLabel={navAria}
          onNavigate={() => setIsDrawerOpen(false)}
        />

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            type="button"
            onClick={() => {
              setIsDrawerOpen(false);
              setIsHelpOpen(true);
            }}
            className="ox-btn ox-btn-ghost"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontSize: "0.82rem",
              color: "var(--ice-text)",
              border: "1px solid var(--ice-border)",
            }}
            title={helpAria}
          >
            <HelpCircle size={16} style={{ color: "#f43f5e" }} />
            <span>{helpButton}</span>
          </button>

          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="ox-btn ox-btn-ghost"
              style={{ width: "100%" }}
              title={logoutTitle}
            >
              {logoutLabel}
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ display: "flex", flexDirection: "column", minWidth: 0, width: "100%" }}>
        <header className="ox-header">
          <div className="ox-header-left">
            <button
              type="button"
              className="ox-menu-btn"
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Ouvrir le menu de navigation"
              aria-expanded={isDrawerOpen}
            >
              <Menu size={20} />
            </button>
            <h1 className="ox-header-title" style={{ margin: 0, fontSize: "1.45rem", fontWeight: 650 }}>
              {heading}
            </h1>
          </div>

          <div className="ox-header-right" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Quick Chat & Calls Link (hidden when already on /chat) */}
            {pathname !== "/chat" && (
              <Link
                href="/chat"
                title="Messagerie interne & Appels"
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.15))",
                  background: "var(--ice-card-bg, rgba(255, 255, 255, 0.05))",
                  color: "var(--gold, #d4af37)",
                  transition: "all 0.2s ease",
                }}
              >
                <MessageSquare size={17} />
                {unreadChatCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -4,
                      minWidth: 16,
                      height: 16,
                      borderRadius: 8,
                      background: "#ef4444",
                      color: "#fff",
                      fontSize: "0.62rem",
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 3px",
                      boxShadow: "0 0 6px #ef4444",
                    }}
                  >
                    {unreadChatCount > 9 ? "9+" : unreadChatCount}
                  </span>
                )}
              </Link>
            )}

            {/* Admin Notifications Bell (DG / Admin alerts) */}
            <AdminNotificationsBell userRole={user.role} />

            {/* Hardware & Browser Permissions Onboarding / Status (Desktop header, in menu on mobile) */}
            <div className="ox-header-desktop-only">
              <DevicePermissionsSetup />
            </div>

            {/* Self-service Password Change Modal (Desktop header, in menu on mobile) */}
            <div className="ox-header-desktop-only">
              <ChangePasswordModal />
            </div>

            {/* Bouton Centre d'Aide & Documentation */}
            <button
              type="button"
              onClick={() => setIsHelpOpen(true)}
              className="ox-header-desktop-only"
              title={helpTitle}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 8,
                border: "1px solid rgba(225, 29, 72, 0.4)",
                background: "linear-gradient(135deg, rgba(225, 29, 72, 0.15) 0%, rgba(15, 23, 42, 0.6) 100%)",
                color: "#fda4af",
                fontSize: "0.82rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <HelpCircle size={15} style={{ color: "#f43f5e" }} />
              <span>{helpButton}</span>
            </button>

            <PrefsControls />
            <div className="ox-user-meta">
              <strong style={{ fontSize: "0.9rem" }}>{user.fullName}</strong>
              <span
                style={{ fontSize: "0.78rem", color: "var(--ice-text-muted)" }}
                title={roleLabel}
              >
                {roleLabel}
              </span>
            </div>
          </div>
        </header>

        <div className="ox-content">{children}</div>
      </main>

      {pathname !== "/chat" && (
        <OnboardingHost
          role={user.role}
          userName={user.fullName}
          userId={user.id}
        />
      )}

      <HelpCenterModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        userRole={user.role}
        userName={user.fullName}
      />

      <GlobalCallManager currentUserId={user.id} />
    </div>
  );
}
