import https from 'https';

async function getCategoryFilesDetailed(categoryTitle: string): Promise<string[]> {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent(categoryTitle)}&cmtype=file&cmlimit=50&format=json`;
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'OxcarMotorsVehicleCatalog/1.0 (contact@oxcarmotors.bj)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve((json?.query?.categorymembers || []).map((m: any) => m.title.replace(/^File:/, '')));
        } catch { resolve([]); }
      });
    }).on('error', () => resolve([]));
  });
}

async function searchFiles(query: string): Promise<string[]> {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=10&format=json`;
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'OxcarMotorsVehicleCatalog/1.0 (contact@oxcarmotors.bj)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve((json?.query?.search || []).map((s: any) => s.title.replace(/^File:/, '')));
        } catch { resolve([]); }
      });
    }).on('error', () => resolve([]));
  });
}

async function main() {
  const tasks = [
    { name: 'Hilux', cat: 'Category:Toyota Hilux (AN120)' },
    { name: 'Fortuner', cat: 'Category:Toyota Fortuner (AN160)' },
    { name: 'Camry', cat: 'Category:Toyota Camry (XV70)' },
    { name: 'Mitsubishi L200', cat: 'Category:Mitsubishi L200 (2019)' },
    { name: 'Mitsubishi Xpander', q: 'Mitsubishi Xpander (front) OR (rear)' },
    { name: 'Kia Sportage', q: '2022 Kia Sportage GT-Line front OR rear' },
    { name: 'Kia Seltos', q: 'Kia Seltos SP2 front OR rear' },
    { name: 'Ford Transit', q: 'Ford Transit Custom 2023 front OR rear' },
    { name: 'BMW X3', q: '2019 BMW X3 xDrive 30i Luxury front OR rear' },
    { name: 'Mercedes GLE', cat: 'Category:Mercedes-Benz W167' },
  ];

  for (const t of tasks) {
    console.log(`\n=== ${t.name} ===`);
    let files: string[] = [];
    if (t.cat) {
      files = await getCategoryFilesDetailed(t.cat);
    } else if (t.q) {
      files = await searchFiles(t.q);
    }
    console.log(`Found ${files.length} candidates:`);
    for (const f of files.slice(0, 10)) {
      console.log(`  * ${f}`);
    }
  }
}

main();
