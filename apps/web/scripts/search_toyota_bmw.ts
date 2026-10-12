import https from 'https';

async function searchFiles(query: string): Promise<string[]> {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=15&format=json`;
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
  const searches = [
    { name: 'Hilux Revo', q: 'Toyota Hilux Revo front OR rear' },
    { name: 'Toyota Fortuner', q: 'Toyota Fortuner front OR rear' },
    { name: 'Toyota Camry XV70', q: 'Toyota Camry 2018 OR 2020 front OR rear' },
    { name: 'BMW X3 G01', q: 'BMW X3 G01 front OR rear' },
    { name: 'Kia Sportage NQ5', q: 'Kia Sportage NQ5 front OR rear' },
    { name: 'Mitsubishi Xpander', q: 'Mitsubishi Xpander 2022 front OR rear' },
  ];

  for (const s of searches) {
    const list = await searchFiles(s.q);
    console.log(`\n=== ${s.name} ===`);
    for (const f of list.slice(0, 8)) {
      console.log(`  * ${f}`);
    }
  }
}

main();
