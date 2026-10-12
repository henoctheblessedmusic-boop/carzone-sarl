import https from 'https';

async function listCategoryFiles(category: string): Promise<string[]> {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category:${encodeURIComponent(category)}&cmtype=file&cmlimit=50&format=json`;
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'OxcarMotorsVehicleCatalog/1.0 (contact@oxcarmotors.bj)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const members = json?.query?.categorymembers || [];
          resolve(members.map((m: any) => m.title));
        } catch {
          resolve([]);
        }
      });
    }).on('error', () => resolve([]));
  });
}

const testCats = [
  'Mitsubishi Outlander (fourth generation)',
  'Jeep Grand Cherokee (WL)',
  'Toyota Corolla Cross',
  'Jetour Traveller',
  'Jetour Dashing',
  'Toyota HiAce (H300)',
  'Toyota Hilux (AN120/AN130)',
  'Toyota Fortuner (AN150/AN160)',
  'Toyota Camry (XV70)',
  'Kia Sportage (NQ5)',
  'Kia Seltos',
  'Dongfeng Nammi 01',
  'Mitsubishi Xpander',
  'BMW X3 (G01)',
  'Mercedes-Benz W167'
];

async function run() {
  for (const cat of testCats) {
    const files = await listCategoryFiles(cat);
    console.log(`\n=== Category:${cat} (${files.length} files) ===`);
    for (const f of files.slice(0, 8)) {
      console.log(`  - ${f}`);
    }
  }
}

run();
