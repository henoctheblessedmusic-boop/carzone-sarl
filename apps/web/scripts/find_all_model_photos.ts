import https from 'https';

async function fetchWikiJson(query: string): Promise<any> {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=15&format=json`;
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'OxcarMotorsVehicleCatalog/1.0 (contact@oxcarmotors.bj)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function getFileInfo(titles: string[]): Promise<any> {
  const titlesStr = titles.map(t => encodeURIComponent(t)).join('|');
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${titlesStr}&prop=imageinfo&iiprop=url|size&format=json`;
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'OxcarMotorsVehicleCatalog/1.0 (contact@oxcarmotors.bj)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

const queries = [
  { name: 'MITSUBISHI OUTLANDER', q: 'Mitsubishi Outlander 2022 front OR rear' },
  { name: 'MITSUBISHI L200', q: 'Mitsubishi Triton L200 2020 OR 2024' },
  { name: 'MITSUBISHI XPANDER', q: 'Mitsubishi Xpander' },
  { name: 'TOYOTA COROLLA CROSS', q: 'Toyota Corolla Cross front OR rear OR interior' },
  { name: 'TOYOTA CAMRY', q: 'Toyota Camry XV70 white front OR rear' },
  { name: 'TOYOTA FORTUNER', q: 'Toyota Fortuner AN160 front OR rear' },
  { name: 'TOYOTA HIACE', q: 'Toyota HiAce H300 white front OR rear OR interior' },
  { name: 'KIA SPORTAGE', q: 'Kia Sportage NQ5 front OR rear' },
  { name: 'KIA SELTOS', q: 'Kia Seltos SP2 front OR rear' },
  { name: 'BAIC X55', q: 'Beijing X55 OR BAIC X55' },
  { name: 'DONGFENG RICH 7', q: 'Dongfeng Rich 7 OR Zhengzhou Nissan Rich 7' },
  { name: 'DONGFENG NAMMI', q: 'Dongfeng Nammi 01 OR Nammi 01' },
  { name: 'BMW X3', q: 'BMW X3 G01 white front OR rear' },
  { name: 'FORD TRANSIT', q: 'Ford Transit Custom 2020 white front OR rear' },
  { name: 'LYNK & CO 06', q: 'Lynk & Co 06 front OR rear' },
  { name: 'JETOUR DASHING', q: 'Jetour Dashing front OR rear OR interior' },
];

async function run() {
  for (const item of queries) {
    console.log(`\n=================== ${item.name} ===================`);
    const res = await fetchWikiJson(item.q);
    const items = res?.query?.search || [];
    const titles = items.map((i: any) => i.title).slice(0, 8);
    if (titles.length === 0) {
      console.log('No results');
      continue;
    }
    const infoRes = await getFileInfo(titles);
    const pages = infoRes?.query?.pages || {};
    for (const pid of Object.keys(pages)) {
      const page = pages[pid];
      const ii = page.imageinfo?.[0];
      if (ii) {
        console.log(`- ${page.title}`);
        console.log(`  ${ii.url}`);
      }
    }
  }
}

run().catch(console.error);
