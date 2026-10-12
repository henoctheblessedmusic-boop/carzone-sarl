import https from 'https';

async function testUrl(url: string): Promise<number> {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'OxcarMotorsVehicleCatalog/1.0 (contact@oxcarmotors.bj)' } }, (res) => {
      resolve(res.statusCode || 0);
    }).on('error', () => resolve(0));
  });
}

async function getCommonsUrl(fileName: string): Promise<string | null> {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(fileName)}&prop=imageinfo&iiprop=url&format=json`;
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'OxcarMotorsVehicleCatalog/1.0 (contact@oxcarmotors.bj)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json?.query?.pages || {};
          const page = Object.values(pages)[0] as any;
          resolve(page?.imageinfo?.[0]?.url || null);
        } catch { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

const filesToCheck = [
  // Mitsubishi L200 Series 6 White
  '2019 Mitsubishi L200 Warrior DI-D 2.3 Front.jpg',
  '2019 Mitsubishi L200 Warrior DI-D 2.3 Rear.jpg',
  '2019 Mitsubishi L200 Barbarian X DI-D Automatic 2.3.jpg',
  // Kia Seltos Snow White Pearl
  '2022 Kia Seltos EX in Snow White Pearl, front right.jpg',
  '2022 Kia Seltos EX in Snow White Pearl, rear right.jpg',
  'Kia Seltos SP2 PE Snow White Pearl (13).jpg',
  // Mercedes GLE 450 Polar White
  '2019 Mercedes-Benz GLE 450 AMG Line Premium+ 4MATIC 3.0 Front.jpg',
  '2019 Mercedes-Benz GLE 450 AMG Line Premium+ 4MATIC 3.0 Rear.jpg',
  // Toyota Camry White
  '2020 Toyota Camry 2.5 (Front view).jpg',
  '2018 Toyota Camry 2.0G (Rear).jpg',
  '2018 Toyota Camry rear 4.8.18.jpg',
  // Toyota Fortuner White
  'Toyota Fortuner 4x4 Legender (LTD) 2022.jpg',
  'Toyota Fortuner (second generation) (rear), Serdang.jpg',
  // Toyota Hilux White
  '2020 Toyota Hilux E (front left side view).jpg',
  '2018 Toyota Hilux Revo.jpg',
  '2015 Toyota Hilux Revo Smart Cab Prerunner 2.4 G Front.jpg',
  // BMW X3 G01 White
  'BMW X3 G01 xDrive 20D 2023 (1).jpg',
  '2019 BMW X3 xDrive30i front.jpg',
  // Kia Sportage White
  'Kia Sportage (NQ5) in White, front left.jpg',
  'Kia Sportage NQ5 Snow White Pearl (7).jpg',
  // Mitsubishi Xpander
  '2022 Mitsubishi Xpander Cross (Indonesia) front view.jpg',
  '2020 Mitsubishi Xpander Cross (Indonesia) rear view.jpg',
  // Ford Transit White
  'Ford Transit Custom (2023) 1X7A1605.jpg',
  'Ford Transit Custom IAA 2022 (DSC05671).jpg',
];

async function main() {
  for (const f of filesToCheck) {
    const url = await getCommonsUrl(f);
    if (url) {
      const code = await testUrl(url);
      console.log(`[${code === 200 ? 'OK' : 'FAIL ' + code}] ${f}`);
      console.log(`     ${url}`);
    } else {
      console.log(`[NOT FOUND] ${f}`);
    }
  }
}

main();
