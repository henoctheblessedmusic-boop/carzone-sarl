const fs = require("fs");
const path = require("path");

const [, , port, outDir] = process.argv;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const app = "https://carzone-sarl.vercel.app";
const password = process.env.FORMATION_PASSWORD || "";

const common = [
  ["commun/01-ecran-connexion.png", "/login"],
  ["commun/02-tableau-de-bord-generique.png", "/dashboard"],
  ["commun/03-menu-lateral.png", "/dashboard"],
];

const roles = [
  { slug: "pdg", email: "formation.pdg@carzone.bj", prefix: "01-ecran-connexion", shots: [["02-tableau-de-bord", "/dashboard"], ["03-indicateurs-dashboard", "/dashboard"], ["04-liste-factures", "/invoices"]] },
  { slug: "dg", email: "formation.dg@carzone.bj", prefix: "01-ecran-connexion", shots: [["02-tableau-de-bord", "/dashboard"], ["03-cloche-notifications", "/dashboard"]] },
  { slug: "adv", email: "formation.adv@carzone.bj", prefix: "01-ecran-connexion", shots: [["02-menu", "/dashboard"], ["03-liste-devis-statuts", "/quotes"]] },
  { slug: "rf", email: "formation.rf@carzone.bj", prefix: "01-connexion", shots: [["02-dashboard-financier", "/dashboard"]] },
  { slug: "rh", email: "formation.rh@carzone.bj", prefix: "01-connexion", shots: [["02-menu-rh", "/dashboard"], ["03-demande-conge", "/hr"]] },
  { slug: "rta", email: "formation.rta@carzone.bj", prefix: "01-connexion", shots: [["02-menu-atelier", "/dashboard"], ["03-ordre-reparation", "/workshop"]] },
  { slug: "dc", email: "formation.dc@carzone.bj", prefix: "01-connexion", shots: [["02-menu-pipeline", "/dashboard"], ["03-pipeline-etapes", "/opportunities"]] },
  { slug: "chef-atelier", email: "formation.chef-atelier@carzone.bj", prefix: "01-connexion", shots: [["02-menu-atelier", "/dashboard"], ["03-nouvel-or", "/workshop"]] },
  { slug: "commercial", email: "formation.commercial@carzone.bj", prefix: "01-connexion", shots: [["02-dashboard-commercial", "/dashboard"], ["03-nouveau-prospect", "/leads"]] },
  { slug: "hotesse", email: "formation.hotesse@carzone.bj", prefix: "01-connexion", shots: [["02-menu", "/dashboard"], ["03-fiche-client", "/clients"]] },
  { slug: "assistante-comptable", email: "formation.assistante-comptable@carzone.bj", prefix: "01-connexion", shots: [["02-menu", "/dashboard"], ["03-enregistrer-paiement", "/invoices"]] },
  { slug: "gestionnaire-location", email: "formation.gestionnaire-location@carzone.bj", prefix: "01-connexion", shots: [["02-menu-restreint", "/dashboard"], ["03-nouveau-contrat", "/rentals"]] },
  { slug: "compta", email: "formation.compta@carzone.bj", prefix: "01-connexion", shots: [["02-dashboard-financier", "/dashboard"], ["03-transcription-facture", "/invoices"]] },
  { slug: "compta-garage", email: "formation.compta-garage@carzone.bj", prefix: "01-connexion", shots: [["02-dashboard-garage", "/dashboard"], ["03-factures-garage", "/invoices"]] },
  { slug: "stock", email: "formation.stock@carzone.bj", prefix: "01-connexion", shots: [["02-menu-stock", "/dashboard"], ["03-nouveau-vehicule", "/vehicles"], ["import-suivi", "/imports"]] },
  { slug: "stock-garage", email: "formation.stock-garage@carzone.bj", prefix: "01-connexion", shots: [["02-menu-pieces", "/dashboard"], ["03-mouvement-stock", "/parts"]] },
  { slug: "atelier", email: "formation.atelier@carzone.bj", prefix: "01-connexion", shots: [["02-menu-atelier", "/dashboard"], ["03-diagnostic-or", "/workshop"]] },
  { slug: "bornes-ops", email: "formation.bornes-ops@carzone.bj", prefix: "01-connexion", shots: [["02-menu-bornes", "/dashboard"], ["03-demande-installation", "/charge-requests"]] },
  { slug: "installateur", email: "formation.installateur@carzone.bj", prefix: "01-connexion", shots: [["02-menu-installateur", "/dashboard"], ["03-reponse-devis", "/charge-requests"]] },
  { slug: "admin", email: "formation.admin@carzone.bj", prefix: "01-connexion", shots: [["02-menu-admin", "/dashboard"], ["03-gestion-comptes", "/users"]] },
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

async function connect() {
  const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const target = list.find((item) => item.type === "page");
  if (!target) throw new Error("Aucune page Chrome disponible");
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const requestId = ++id;
      pending.set(requestId, { resolve, reject });
      ws.send(JSON.stringify({ id: requestId, method, params }));
    });
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const request = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) request.reject(new Error(JSON.stringify(message.error)));
      else request.resolve(message.result);
    }
  };
  return { ws, send };
}

async function main() {
  ensureDir(outDir);
  const { ws, send } = await connect();
  const evaluate = async (expression) => (await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result.value;
  const screenshot = async (relativePath) => {
    const absolute = path.join(outDir, relativePath);
    ensureDir(path.dirname(absolute));
    const result = await send("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: false });
    fs.writeFileSync(absolute, Buffer.from(result.data, "base64"));
    console.log("capture", relativePath);
  };
  const navigate = async (url) => {
    await send("Page.navigate", { url: `${app}${url}` });
    await sleep(2200);
  };
  const dismissOnboarding = async () => {
    await evaluate(`(() => { const button = Array.from(document.querySelectorAll('button')).find((item) => item.textContent.includes("J'ai compris")); if (button) { button.click(); return true; } return false; })()`);
    await sleep(500);
  };

  await send("Runtime.enable");
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1600, height: 1000, deviceScaleFactor: 1, mobile: false });
  await send("Network.clearBrowserCookies");
  await navigate("/login");
  await screenshot(common[0][0]);
  await evaluate(`document.querySelector('input[name="email"]').value='formation.dg@carzone.bj';document.querySelector('input[name="email"]').dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('input[name="password"]').value=${JSON.stringify(password)}document.querySelector('input[name="password"]').dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('form').requestSubmit();`);
  await sleep(5200);
  await dismissOnboarding();

  for (const [relativePath, url] of common.slice(1)) {
    await navigate(url);
    await dismissOnboarding();
    await screenshot(relativePath);
  }

  for (const role of roles) {
    await send("Network.clearBrowserCookies");
    await navigate("/login");
    await evaluate(`document.querySelector('input[name="email"]').value=${JSON.stringify(role.email)};document.querySelector('input[name="email"]').dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('input[name="password"]').value=${JSON.stringify(password)}document.querySelector('input[name="password"]').dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('form').requestSubmit();`);
    await sleep(5200);
    const currentPath = await evaluate("location.pathname");
    if (currentPath === "/login") {
      console.error("LOGIN FAILED", role.slug);
      continue;
    }
    await dismissOnboarding();
    const prefix = role.prefix.replace(/^01-/, "01-");
    ensureDir(path.join(outDir, role.slug));
    fs.copyFileSync(path.join(outDir, common[0][0]), path.join(outDir, role.slug, `${prefix}.png`));
    for (const [name, url] of role.shots) {
      await navigate(url);
      const pathNow = await evaluate("location.pathname");
      if (pathNow === "/login") {
        console.error("REDIRECT LOGIN", role.slug, name);
        continue;
      }
      await dismissOnboarding();
      await screenshot(path.join(role.slug, `${name}.png`));
    }
    console.log("role done", role.slug);
  }

  ws.close();
}

main().catch((error) => {
  console.error("CAPTURE FAILED", error);
  process.exitCode = 1;
});
