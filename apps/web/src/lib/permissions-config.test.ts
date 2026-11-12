import { describe, expect, it } from "vitest";
import {
  getEffectiveCapabilities,
  NO_CAPABILITIES_SENTINEL,
} from "./permissions-config";
import { RoleService } from "./role-service";

describe("capacites personnalisees", () => {
  it("remplace les capacites du role quand une personnalisation existe", () => {
    expect(getEffectiveCapabilities("COMMERCIAL", ["customers:view_global"])).toEqual([
      "customers:view_global",
    ]);
  });

  it("conserve les capacites du role quand aucune personnalisation n'existe", () => {
    expect(getEffectiveCapabilities("COMMERCIAL", [])).toContain("estimates:view_global");
  });

  it("ne redonne aucun droit avec la sentinelle de revocation totale", () => {
    expect(getEffectiveCapabilities("COMMERCIAL", [NO_CAPABILITIES_SENTINEL])).toEqual([]);
  });

  it("applique une restriction personnalisee au moteur de routes et d'API", () => {
    const restricted = {
      id: "test",
      role: "COMMERCIAL" as const,
      customPermissions: ["customers:view_global"],
    };
    expect(RoleService.userHasPermission(restricted, "quotes:read")).toBe(false);
    expect(RoleService.userHasPermission(restricted, "clients:read")).toBe(true);
  });

  it("revocation totale : aucun droit metier ne reste ouvert", () => {
    const revoked = {
      id: "test",
      role: "COMMERCIAL" as const,
      customPermissions: [NO_CAPABILITIES_SENTINEL],
    };
    expect(RoleService.userHasPermission(revoked, "quotes:read")).toBe(false);
    expect(RoleService.userHasPermission(revoked, "clients:read")).toBe(false);
    expect(RoleService.userHasPermission(revoked, "vehicles:read")).toBe(false);
  });
});
