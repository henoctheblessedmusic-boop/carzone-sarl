import type { ReactNode } from "react";
import type { SessionUser } from "@/lib/auth";
import { AppShellClient } from "@/components/AppShellClient";
import { NAV_KEYS_BY_HREF, roleLabel, type PageKey } from "@/lib/i18n";
import { getServerMessages } from "@/lib/i18n/server";
import { RoleService } from "@/lib/role-service";

export type { PageKey };

const navDefs = [
  { href: "/dashboard", roles: null as string[] | null },
  { href: "/clients", roles: null },
  { href: "/workshop", roles: ["PDG", "SG", "DG", "ADV", "RF", "RTA", "DC", "CHEF_ATELIER", "ASSISTANTE_COMPTABLE", "ATELIER", "COMPTA", "ADMIN"] },
  { href: "/parts", roles: ["PDG", "SG", "DG", "ADV", "RF", "RTA", "DC", "CHEF_ATELIER", "ATELIER", "STOCK", "COMPTA", "ADMIN", "COMMERCIAL"] },
  { href: "/vehicles", roles: ["PDG", "SG", "DG", "ADV", "RF", "RTA", "DC", "COMMERCIAL", "HOTESSE", "CHEF_ATELIER", "ASSISTANTE_COMPTABLE", "STOCK", "COMPTA", "ADMIN"] },
  { href: "/quotes", roles: ["PDG", "SG", "DG", "ADV", "RF", "RTA", "DC", "COMMERCIAL", "HOTESSE", "CHEF_ATELIER", "ASSISTANTE_COMPTABLE", "COMPTA", "ADMIN"] },
  { href: "/invoices", roles: ["PDG", "SG", "DG", "ADV", "RF", "COMMERCIAL", "HOTESSE", "CHEF_ATELIER", "ASSISTANTE_COMPTABLE", "COMPTA", "ADMIN"] },
  { href: "/expenses", roles: ["PDG", "SG", "DG", "ADV", "RF", "COMPTA", "ASSISTANTE_COMPTABLE", "RH", "ADMIN"] },
  { href: "/services", roles: ["PDG", "SG", "DG", "ADV", "RF", "RTA", "DC", "COMMERCIAL", "HOTESSE", "ASSISTANTE_COMPTABLE", "CHEF_ATELIER", "STOCK", "COMPTA", "ADMIN"] },
  { href: "/hr", roles: ["PDG", "SG", "DG", "RH", "COMPTA", "RF", "ASSISTANTE_COMPTABLE", "ADMIN"] },
  { href: "/users", roles: ["PDG", "SG", "DG", "ADV", "RTA", "DC", "ADMIN", "RH"] },
  { href: "/opportunities", roles: ["PDG", "SG", "DG", "ADV", "RF", "DC", "COMMERCIAL", "COMPTA", "ADMIN"] },
  { href: "/leads", roles: ["PDG", "SG", "DG", "ADV", "RF", "DC", "COMMERCIAL", "COMPTA", "ADMIN"] },
  { href: "/catalog", roles: ["PDG", "SG", "DG", "ADV", "RF", "RTA", "DC", "STOCK", "ADMIN"] },
  { href: "/mailbox", roles: ["PDG", "SG", "DG", "ADV", "RF", "COMMERCIAL", "HOTESSE", "CHEF_ATELIER", "ASSISTANTE_COMPTABLE", "COMPTA", "BORNES_OPS", "ADMIN"] },
  { href: "/chat", roles: null as string[] | null },
  { href: "/rentals", roles: ["PDG", "SG", "DG", "ADV", "RF", "COMMERCIAL", "COMPTA"] },
  { href: "/fleet", roles: ["PDG", "SG", "DG", "ADV", "RF", "COMMERCIAL", "BORNES_OPS", "ADMIN"] },
  { href: "/imports", roles: ["PDG", "SG", "DG", "ADV", "RF", "STOCK", "COMPTA", "ADMIN"] },
  { href: "/installers", roles: ["PDG", "SG", "DG", "BORNES_OPS", "COMMERCIAL", "INSTALLATEUR"] },
  { href: "/charge-requests", roles: ["PDG", "SG", "DG", "BORNES_OPS", "COMMERCIAL", "INSTALLATEUR"] },
  { href: "/charging", roles: ["PDG", "SG", "DG", "BORNES_OPS", "COMPTA"] },
  { href: "/terminal", roles: ["PDG", "SG", "DG", "BORNES_OPS"] },
];

export async function AppShell({
  user,
  children,
  titleKey,
  title,
}: {
  user: SessionUser;
  children: ReactNode;
  titleKey?: PageKey;
  title?: string;
}) {
  const { messages } = await getServerMessages();
  const heading = (titleKey ? messages.pages[titleKey] : undefined) ?? title ?? "";
  const isSuperAdmin =
    user.role === "DEVELOPER" ||
    user.role === "DG" ||
    user.role === "PDG" ||
    user.role === "SG";

  const items = navDefs
    .filter((n) => {
      if (!n.roles) return true;
      if (isSuperAdmin) return true;
      if (RoleService.isRouteAllowedForUser(user, n.href)) return true;
      return n.roles.includes(user.role);
    })
    .map((n) => {
      const key = NAV_KEYS_BY_HREF[n.href];
      return {
        href: n.href,
        label: (key && messages.nav[key]) ? messages.nav[key] : n.href,
        roles: n.roles,
      };
    });

  const tagline = "DRIVE YOUR DREAM";

  return (
    <AppShellClient
      user={user}
      items={items}
      heading={heading}
      roleLabel={roleLabel(messages, user.role)}
      tagline={tagline}
      logoutLabel={messages.common.logout}
      logoutTitle={messages.common.logoutTitle}
      navAria={messages.nav.aria}
    >
      {children}
    </AppShellClient>
  );
}
