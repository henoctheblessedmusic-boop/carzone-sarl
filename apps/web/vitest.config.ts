import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Premier lanceur de tests du projet. Il ne couvre que des fonctions pures :
 * aucun acces base, aucun rendu de composant. Playwright viendra a l'etape 3,
 * quand il y aura une interface a parcourir.
 *
 * globals reste a false : chaque test importe describe/it/expect depuis vitest,
 * ce qui evite d'ajouter des types globaux au tsconfig de l'application.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    globals: false,
  },
});
