import https from 'https';

async function searchCategory(term: string): Promise<string[]> {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(term)}&srnamespace=14&srlimit=5&format=json`;
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'OxcarMotorsVehicleCatalog/1.0 (contact@oxcarmotors.bj)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve((json?.query?.search || []).map((s: any) => s.title));
        } catch { resolve([]); }
      });
    }).on('error', () => resolve([]));
  });
}

async function listCategoryFiles(categoryTitle: string): Promise<string[]> {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent(categoryTitle)}&cmtype=file&cmlimit=30&format=json`;
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'OxcarMotorsVehicleCatalog/1.0 (contact@oxcarmotors.bj)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve((json?.query?.categorymembers || []).map((m: any) => m.title));
        } catch { resolve([]); }
      });
    }).on('error', () => resolve([]));
  });
}

const terms = [
  'Toyota Hilux AN120',
  'Toyota Fortuner AN160',
  'Toyota Camry XV70',
  'Mitsubishi Triton fifth generation',
  'Mitsubishi Triton sixth generation',
  'Mitsubishi Xpander',
  'Beijing X55',
  'Kia Seltos',
  'Kia Sportage NQ5',
  'Ford Transit Custom',
  'BMW G01',
  'Rich 7',
  'Lynk & Co 06'
];

async function run() {
  for (const t of terms) {
    const cats = await searchCategory(t);
    console.log(`\n=== Term: ${t} ===`);
    for (const c of cats) {
      console.log(`  Found cat: ${c}`);
      const files = await listCategoryFiles(c);
      console.log(`    Files (${files.length}):`);
      for (const f of files.slice(0, 6)) {
        console.log(`      * ${f}`);
      }
    }
  }
}

run();
