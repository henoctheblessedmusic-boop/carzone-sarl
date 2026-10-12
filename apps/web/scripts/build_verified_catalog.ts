import https from 'https';

async function getFileUrls(fileNames: string[]): Promise<Record<string, string>> {
  const titles = fileNames.map(f => f.startsWith('File:') ? f : `File:${f}`).join('|');
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(titles)}&prop=imageinfo&iiprop=url&format=json`;
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'OxcarMotorsVehicleCatalog/1.0 (contact@oxcarmotors.bj)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json?.query?.pages || {};
          const result: Record<string, string> = {};
          for (const pid of Object.keys(pages)) {
            const p = pages[pid];
            if (p.title && p.imageinfo?.[0]?.url) {
              result[p.title.replace(/^File:/, '')] = p.imageinfo[0].url;
            }
          }
          resolve(result);
        } catch { resolve({}); }
      });
    }).on('error', () => resolve({}));
  });
}

async function main() {
  const filesToResolve = [
    // Mitsubishi Outlander 2022 White US SE Launch Edition (SAME CAR)
    '2022 Mitsubishi Outlander SE Launch Edition (United States) front view 01.png',
    '2022 Mitsubishi Outlander SE Launch Edition (United States) front view 02.png',
    '2022 Mitsubishi Outlander SE Launch Edition (United States) rear view.png',
    '2022 Mitsubishi Outlander ES 2WD 7seater front.jpg',
    '2022 Mitsubishi Outlander ES 2WD 7seater rear.jpg',
    // Toyota Corolla Cross 2020 (SAME CAR)
    '2020 Toyota Corolla Cross - Front.jpg',
    '2020 Toyota Corolla Cross - Side.jpg',
    '2020 Toyota Corolla Cross - Rear.jpg',
    // Jeep Grand Cherokee Summit Reserve Bright White (SAME CAR)
    '2022 Jeep Grand Cherokee Summit Reserve 4x4 in Bright White, Front Left, 01-16-2022.jpg',
    '2022 Jeep Grand Cherokee Summit Reserve 4x4 in Bright White, Rear Left, 01-16-2022.jpg',
    // Jetour T2 Traveller (SAME CAR showroom)
    'Jetour Traveller 001.jpg',
    'Jetour Traveller 006.jpg',
    'Jetour T2 (вид сбоку).jpg',
    'Jetour T2 interior.jpg',
    // Jetour Dashing (SAME CAR showroom)
    'Jetour Dasheng 001.jpg',
    'Jetour Dasheng 002.jpg',
    'Jetour Dasheng 003.jpg',
    '2025 Jetour Dashing interior (Malaysia) 01.png',
    // Dongfeng Nammi 01 (SAME CAR showroom)
    'Dongfeng Nammi Electric Vehicle 2024 (1).jpg',
    'Dongfeng Nammi Electric Vehicle 2024 (2).jpg',
    'Dongfeng Nammi Electric Vehicle 2024 (3).jpg',
    'Dongfeng Nammi 01 at Auto Guangzhou 2023 20231126.jpg',
    // Dongfeng Rich 7 (SAME CAR showroom)
    'Dongfeng Rich 7 001.jpg',
    'DONGFENG RICH 7 (NISSAN NAVARA (D23)).jpg',
    'DONGFENG RICH 7 (NISSAN NAVARA (D23)) (2).jpg',
    // BAIC Beijing X55 (SAME CAR)
    'BAIC X55 front.jpg',
    'BAIC X55 rear.jpg',
    'BAiC X55 210T Comfort 2023.jpg',
    'BAIC (Beijing) X55 162254.jpg',
    // Lynk & Co 06 PHEV (SAME CAR)
    '2023 Lynk & Co 06 PHEV (front).jpg',
    '2023 Lynk & Co 06 PHEV (rear).jpg',
    '2023 Lynk & Co 06 PHEV interior.jpg',
    // Toyota HiAce 2020 White H300 (SAME CAR)
    '2020 Toyota HiAce (front).jpg',
    '2020 Toyota HiAce (rear).jpg',
    '2019 Toyota HiAce (front).jpg',
    '2019 Toyota HiAce (rear).jpg',
  ];

  const res = await getFileUrls(filesToResolve);
  for (const [name, url] of Object.entries(res)) {
    console.log(`OK: "${name}": "${url}"`);
  }
}

main();
