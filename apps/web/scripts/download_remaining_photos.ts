import fs from "fs";
import path from "path";
import https from "https";

const TARGET_DIR = path.join(process.cwd(), "public", "images", "vehicles");

const REMAINING_IMAGES = [
  // Changan CS75 Plus main
  { filename: "cs75-main.jpg", commonsFile: "Changan_CS75_Plus_001.jpg" },
  // Baic X55 main
  { filename: "x55-main.jpg", commonsFile: "Beijing_Mofang_001.jpg" },
  // Baic B40 interior
  { filename: "b40-interior.jpg", commonsFile: "Beijing_BJ40_IMG001.jpg" },
  // Geely Starship 7 interior
  { filename: "starship7-interior.jpg", commonsFile: "Geely_Galaxy_Starship_7_IMG002.jpg" },
  // Toyota Land Cruiser Prado (TX-L GDJ150)
  { filename: "prado-main.jpg", commonsFile: "Toyota_Land_Cruiser_Prado_GDJ150_FL2_2.8_VX_White_Pearl_Crystal_Shine_01.jpg" },
  { filename: "prado-interior.jpg", commonsFile: "The_interior_of_Toyota_LAND_CRUISER_PRADO_DIESEL_TX_L_Package_5-Seater_(3DA-GDJ150W-GGTEY).jpg" },
  { filename: "prado-exterior.jpg", commonsFile: "Toyota_Land_Cruiser_Prado_GDJ150_FL2_2.8_VX_White_Pearl_Crystal_Shine.jpg" },
  { filename: "prado-rear.jpg", commonsFile: "Toyota_Land_Cruiser_Prado_GDJ150_FL2_2.8_VX_White_Pearl_Crystal_Shine_02.jpg" },
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
          if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
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

async function main() {
  for (const item of REMAINING_IMAGES) {
    const targetFile = path.join(TARGET_DIR, item.filename);
    const directUrl = await getCommonsDirectUrl(item.commonsFile);
    if (!directUrl) {
      console.error(`❌ Non trouvé: ${item.commonsFile}`);
      continue;
    }
    const ok = await downloadFile(directUrl, targetFile);
    if (ok) {
      console.log(`✅ ${item.filename} téléchargé (${(fs.statSync(targetFile).size / 1024).toFixed(1)} KB)`);
    } else {
      console.error(`❌ Échec pour ${item.filename}`);
    }
    await new Promise((r) => setTimeout(r, 400));
  }
}

main().catch(console.error);
