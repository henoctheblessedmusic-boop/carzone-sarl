import type { ReactNode } from "react";
import type { SessionUser } from "@/lib/auth";
import { AppShellClient } from "@/components/AppShellClient";
import { NAV_KEYS_BY_HREF, roleLabel, type NavKey, type PageKey } from "@/lib/i18n";
import { getServerMessages } from "@/lib/i18n/server";
import { RoleService } from "@/lib/role-service";

export type { PageKey };

/** Groupes de menu affichant leurs entrées comme sous-menus sous un intitulé commun. */
type NavGroupKey = "rentals";

const NAV_GROUP_LABEL_KEYS: Record<NavGroupKey, Exclude<NavKey, "aria">> = {
  rentals: "rentals",
};

const RENTAL_NAV_ROLES = ["PDG", "SG", "DG", "COMMERCIAL", "COMPTA", "GESTIONNAIRE_LOCATION"];

type NavDef = {
  href: string;
  roles: string[] | null;
  /** Clé de regroupement : les entrées d'un même groupe sont affichées comme sous-menus. */
  group?: NavGroupKey;
};

const navDefs: NavDef[] = [
  { href: "/dashboard", roles: null as string[] | null },
  { href: "/clients", roles: null },
  { href: "/workshop", roles: ["PDG", "SG", "DG", "ADV", "RF", "RTA", "DC", "CHEF_ATELIER", "ASSISTANTE_COMPTABLE", "ATELIER", "STOCK_GARAGE", "COMPTA", "COMPTA_GARAGE", "ADMIN"] },
  { href: "/catalogue-pieces", roles: ["PDG", "DG", "COMPTA", "STOCK_GARAGE", "DC", "COMMERCIAL"] },
  { href: "/garage-supervision", roles: ["PDG", "SG", "DG", "CHEF_ATELIER", "COMPTA", "COMPTA_GARAGE"] },
  { href: "/parts", roles: ["PDG", "SG", "DG", "ADV", "RF", "RTA", "DC", "CHEF_ATELIER", "ATELIER", "STOCK_GARAGE", "COMPTA", "COMPTA_GARAGE", "ADMIN", "COMMERCIAL"] },
  { href: "/vehicles", roles: ["PDG", "SG", "DG", "ADV", "RF", "RTA", "DC", "COMMERCIAL", "HOTESSE", "CHEF_ATELIER", "ASSISTANTE_COMPTABLE", "ATELIER", "STOCK", "COMPTA", "ADMIN"] },
  { href: "/quotes", roles: ["PDG", "SG", "DG", "ADV", "RF", "RTA", "DC", "COMMERCIAL", "HOTESSE", "CHEF_ATELIER", "ASSISTANTE_COMPTABLE", "COMPTA", "COMPTA_GARAGE", "ADMIN"] },
  { href: "/invoices", roles: ["PDG", "SG", "DG", "ADV", "RF", "COMMERCIAL", "HOTESSE", "CHEF_ATELIER", "ASSISTANTE_COMPTABLE", "COMPTA", "COMPTA_GARAGE", "ADMIN"] },
  { href: "/delivery-notes", roles: ["PDG", "SG", "DG", "ADV", "RF", "COMPTA", "COMPTA_GARAGE", "ADMIN"] },
  { href: "/audit", roles: ["PDG", "SG", "DG", "COMPTA", "COMPTA_GARAGE", "STOCK_GARAGE", "ADMIN"] },
  { href: "/expenses", roles: ["PDG", "SG", "DG", "ADV", "RF", "COMPTA", "ASSISTANTE_COMPTABLE", "RH", "ADMIN"] },
  { href: "/services", roles: ["PDG", "SG", "DG", "ADV", "RF", "RTA", "DC", "COMMERCIAL", "HOTESSE", "ASSISTANTE_COMPTABLE", "CHEF_ATELIER", "STOCK", "COMPTA", "ADMIN"] },
  { href: "/hr", roles: ["PDG", "SG", "DG", "RH", "COMPTA", "RF", "ASSISTANTE_COMPTABLE", "ADMIN"] },
  { href: "/users", roles: ["PDG", "SG", "DG", "ADV", "RTA", "DC", "ADMIN", "RH"] },
  { href: "/opportunities", roles: ["PDG", "SG", "DG", "DC", "COMMERCIAL", "COMPTA", "ADMIN"] },
  { href: "/leads", roles: ["PDG", "SG", "DG", "COMMERCIAL", "COMPTA", "ADMIN"] },
  { href: "/catalog", roles: ["PDG", "SG", "DG", "STOCK"] },
  { href: "/mailbox", roles: ["PDG", "SG", "DG", "ADV", "RF", "COMMERCIAL", "HOTESSE", "CHEF_ATELIER", "ASSISTANTE_COMPTABLE", "COMPTA", "BORNES_OPS", "ADMIN"] },
  { href: "/chat", roles: null as string[] | null },
  // Location : trois sous-menus distincts (parc, contrats, entretiens) sous un seul
  // intitulé "Location". Les trois routes partagent les mêmes rôles et le même
  // moteur de permissions que l'ancienne page /rentals.
  { href: "/rentals/fleet", roles: RENTAL_NAV_ROLES, group: "rentals" },
  { href: "/rentals/contracts", roles: RENTAL_NAV_ROLES, group: "rentals" },
  { href: "/rentals/maintenance", roles: RENTAL_NAV_ROLES, group: "rentals" },
  { href: "/fleet", roles: ["PDG", "SG", "DG", "COMMERCIAL", "BORNES_OPS", "ADMIN"] },
  { href: "/imports", roles: ["PDG", "SG", "DG", "STOCK", "COMPTA"] },
  { href: "/installers", roles: ["PDG", "SG", "DG", "BORNES_OPS", "COMMERCIAL", "INSTALLATEUR"] },
  { href: "/charge-requests", roles: ["PDG", "SG", "DG", "BORNES_OPS", "COMMERCIAL", "INSTALLATEUR"] },
  { href: "/charging", roles: ["PDG", "SG", "DG", "BORNES_OPS", "COMPTA"] },
  { href: "/terminal", roles: ["PDG", "SG", "DG", "BORNES_OPS"] },
  { href: "/mobile-app", roles: null as string[] | null },
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

  // Un lien de menu n'est affiché que s'il est à la fois dans la liste de rôles attendue
  // ET effectivement autorisé par le moteur de permissions (RoleService). Cette intersection
  // évite les menus visibles puis refusés (middleware/garde de page) pour tous les rôles.
  const items = navDefs
    .filter((n) => {
      if (!n.roles) return isSuperAdmin || RoleService.isRouteAllowedForUser(user, n.href);
      if (isSuperAdmin) return true;
      return n.roles.includes(user.role) && RoleService.isRouteAllowedForUser(user, n.href);
    })
    .map((n) => {
      const key = NAV_KEYS_BY_HREF[n.href];
      const groupKey = n.group ? NAV_GROUP_LABEL_KEYS[n.group] : undefined;
      return {
        href: n.href,
        label: (key && messages.nav[key]) ? messages.nav[key] : n.href,
        roles: n.roles,
        group: n.group,
        groupLabel: groupKey ? messages.nav[groupKey] : undefined,
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
      helpButton={messages.help.button}
      helpTitle={messages.help.title}
      helpAria={messages.help.aria}
    >
      {children}
    </AppShellClient>
  );
}
