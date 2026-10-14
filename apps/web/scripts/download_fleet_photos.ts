import fs from "fs";
import path from "path";
import https from "https";

const TARGET_DIR = path.join(process.cwd(), "public", "images", "vehicles");

if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// Liste des images de la flotte certifiée avec les fichiers Wikimedia Commons correspondants
const IMAGES_TO_FETCH: { filename: string; commonsFile: string }[] = [
  // 1. FORTHING RICH 7
  { filename: "rich7-main.jpg", commonsFile: "Dongfeng_Rich_7_image01.jpg" },
  { filename: "rich7-interior.jpg", commonsFile: "Dongfeng_Rich_7_image02.jpg" },
  { filename: "rich7-exterior.jpg", commonsFile: "Dongfeng_Rich_7_image03.jpg" },
  { filename: "rich7-rear.jpg", commonsFile: "Dongfeng_Rich_7_image03.jpg" },

  // 2. FORTHING T5 EVO
  { filename: "t5evo-main.jpg", commonsFile: "Forthing_T5_EVO_011.jpg" },
  { filename: "t5evo-interior.jpg", commonsFile: "Forthing_T5_Evo_IMG008.jpg" },
  { filename: "t5evo-exterior.jpg", commonsFile: "Forthing_T5_Evo_001.jpg" },
  { filename: "t5evo-rear.jpg", commonsFile: "Forthing_T5_Evo_004.jpg" },

  // 3. CHANGAN CS75
  { filename: "cs75-main.jpg", commonsFile: "2019_Chang%27an_CS75_Plus_front_three_quarter.jpg" },
  { filename: "cs75-interior.jpg", commonsFile: "Changan_CS75_Plus_008.jpg" },
  { filename: "cs75-exterior.jpg", commonsFile: "Changan_CS75_Plus_002.jpg" },
  { filename: "cs75-rear.jpg", commonsFile: "Changan_CS75_Plus_006.jpg" },

  // 4. CHANGAN CS35 PLUS
  { filename: "cs35-main.jpg", commonsFile: "Changan_CS35_Plus_facelift_001.jpg" },
  { filename: "cs35-interior.jpg", commonsFile: "Changan_CS35_Plus_facelift_IMG005.jpg" },
  { filename: "cs35-exterior.jpg", commonsFile: "Changan_CS35_Plus_facelift_002.jpg" },
  { filename: "cs35-rear.jpg", commonsFile: "Changan_CS35_Plus_facelift_003.jpg" },

  // 5. CHANGAN UNI-K
  { filename: "unik-main.jpg", commonsFile: "Changan_UNI-K_001.jpg" },
  { filename: "unik-interior.jpg", commonsFile: "Changan_UNI-K_006.jpg" },
  { filename: "unik-exterior.jpg", commonsFile: "Changan_UNI-K_003.jpg" },
  { filename: "unik-rear.jpg", commonsFile: "Changan_UNI-K_002.jpg" },

  // 6. BAIC B40 PRO
  { filename: "b40-main.jpg", commonsFile: "Beijing_BJ40_IMG003.jpg" },
  { filename: "b40-interior.jpg", commonsFile: "Beijing_%28BAIC%29_BJ40_2-door_facelift_interior.jpg" },
  { filename: "b40-exterior.jpg", commonsFile: "Beijing_BJ40_IMG001.jpg" },
  { filename: "b40-rear.jpg", commonsFile: "Beijing_BJ40_IMG004.jpg" },

  // 7. BAIC X55
  { filename: "x55-main.jpg", commonsFile: "Baic_X55_Automesse_Ludwigsburg_2024_1X7A0436.jpg" },
  { filename: "x55-interior.jpg", commonsFile: "Beijing_Mofang_007.jpg" },
  { filename: "x55-exterior.jpg", commonsFile: "Beijing_Mofang_002.jpg" },
  { filename: "x55-rear.jpg", commonsFile: "Beijing_Mofang_006.jpg" },

  // 8. GEELY STARSHIP 7
  { filename: "starship7-main.jpg", commonsFile: "Geely_Galaxy_Starship_7_001.jpg" },
  { filename: "starship7-interior.jpg", commonsFile: "Geely_Galaxy_Starship_7_IMG004.jpg" },
  { filename: "starship7-exterior.jpg", commonsFile: "Geely_Galaxy_Starship_7_IMG002.jpg" },
  { filename: "starship7-rear.jpg", commonsFile: "Geely_Galaxy_Starship_7_IMG003.jpg" },

  // 9. JETOUR DASHING
  { filename: "dashing-main.jpg", commonsFile: "Jetour_Dasheng_001.jpg" },
  { filename: "dashing-interior.jpg", commonsFile: "Jetour_Dasheng_004.jpg" },
  { filename: "dashing-exterior.jpg", commonsFile: "Jetour_Dasheng_003.jpg" },
  { filename: "dashing-rear.jpg", commonsFile: "Jetour_Dasheng_002.jpg" },

  // 10. JETOUR T2
  { filename: "t2-main.jpg", commonsFile: "Jetour_Traveller_001.jpg" },
  { filename: "t2-interior.jpg", commonsFile: "Jetour_Traveller_011.jpg" },
  { filename: "t2-exterior.jpg", commonsFile: "Jetour_Traveller_004.jpg" },
  { filename: "t2-rear.jpg", commonsFile: "Jetour_Traveller_006.jpg" },

  // 11. TOYOTA LAND CRUISER PRADO
  { filename: "prado-main.jpg", commonsFile: "TOYOTA_LAND_CRUISER_PRADO_TX_L_Package_7-Seater_%28GDJ150W-GGTEY%29_Front.jpg" },
  { filename: "prado-interior.jpg", commonsFile: "TOYOTA_LAND_CRUISER_PRADO_TX_L_Package_7-Seater_%28GDJ150W-GGTEY%29_Interior.jpg" },
  { filename: "prado-exterior.jpg", commonsFile: "TOYOTA_LAND_CRUISER_PRADO_TX_L_Package_7-Seater_%28GDJ150W-GGTEY%29_Side.jpg" },
  { filename: "prado-rear.jpg", commonsFile: "TOYOTA_LAND_CRUISER_PRADO_TX_L_Package_7-Seater_%28GDJ150W-GGTEY%29_Rear.jpg" },
];

async function getCommonsDirectUrl(fileTitle: string): Promise<string | null> {
  const decoded = decodeURIComponent(fileTitle);
  const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(decoded)}&prop=imageinfo&iiprop=url&format=json`;
  
  const res = await fetch(apiUrl, {
    headers: {
      "User-Agent": "CarzoneApp/1.0 (contact@carzone-sarl.com; https://carzone-sarl.vercel.app)",
    },
  });
  
  if (!res.ok) return null;
  const data = await res.json();
  const pages = data?.query?.pages;
  if (!pages) return null;
  for (const k in pages) {
    const info = pages[k]?.imageinfo?.[0];
    if (info?.url) return info.url;
  }
  return null;
}

async function downloadFile(url: string, destPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(destPath);
    const req = https.get(
      url,
      {
        headers: {
          "User-Agent": "CarzoneApp/1.0 (contact@carzone-sarl.com; https://carzone-sarl.vercel.app)",
        },
      },
      (res) => {
        if (res.statusCode === 200) {
          res.pipe(file);
          file.on("finish", () => {
            file.close();
            resolve(true);
          });
        } else if (res.statusCode === 301 || res.statusCode === 302) {
          const redirectUrl = res.headers.location;
          if (redirectUrl) {
            downloadFile(redirectUrl, destPath).then(resolve);
          } else {
            resolve(false);
          }
        } else {
          file.close();
          fs.unlinkSync(destPath);
          console.error(`Failed ${url}: HTTP ${res.statusCode}`);
          resolve(false);
        }
      }
    );
    req.on("error", (err) => {
      console.error(`Error ${url}:`, err.message);
      file.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      resolve(false);
    });
  });
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log(`🚀 Téléchargement des photos certifiées vers : ${TARGET_DIR}`);

  for (const item of IMAGES_TO_FETCH) {
    const targetFile = path.join(TARGET_DIR, item.filename);
    if (fs.existsSync(targetFile) && fs.statSync(targetFile).size > 1000) {
      console.log(`⏩ Déjà présent: ${item.filename} (${(fs.statSync(targetFile).size / 1024).toFixed(1)} KB)`);
      continue;
    }

    console.log(`🔍 Recherche URL pour : ${item.commonsFile}...`);
    const directUrl = await getCommonsDirectUrl(item.commonsFile);
    if (!directUrl) {
      console.error(`❌ Impossible de trouver l'URL pour ${item.commonsFile}`);
      continue;
    }

    console.log(`⬇️ Téléchargement ${item.filename}...`);
    const ok = await downloadFile(directUrl, targetFile);
    if (ok) {
      const sz = fs.existsSync(targetFile) ? fs.statSync(targetFile).size : 0;
      console.log(`✅ ${item.filename} sauvegardé (${(sz / 1024).toFixed(1)} KB)`);
    } else {
      console.error(`❌ Échec pour ${item.filename}`);
    }

    // Petite pause respectueuse de l'API
    await sleep(400);
  }

  console.log("🏁 Téléchargement terminé !");
}

main().catch(console.error);
