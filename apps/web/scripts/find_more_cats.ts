import https from 'https';

async function searchCategory(term: string): Promise<string[]> {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(term)}&srnamespace=14&srlimit=8&format=json`;
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
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent(categoryTitle)}&cmtype=file&cmlimit=20&format=json`;
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
  'Hilux (AN120)',
  'Fortuner (AN160)',
  'Toyota Camry (XV70)',
  'Mitsubishi Triton',
  'Mitsubishi Xpander',
  'Beijing X55',
  'Dongfeng Rich',
  'Zhengzhou Nissan'
];

async function run() {
  for (const t of terms) {
    const cats = await searchCategory(t);
    console.log(`\n=== Term: ${t} ===`);
    for (const c of cats) {
      console.log(`  Cat: ${c}`);
      const files = await listCategoryFiles(c);
      for (const f of files.slice(0, 5)) {
        console.log(`    * ${f}`);
      }
    }
  }
}

run();
