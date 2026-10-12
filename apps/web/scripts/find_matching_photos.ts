import https from 'https';

async function fetchWikiJson(query: string): Promise<any> {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=20&format=json`;
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
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${titlesStr}&prop=imageinfo&iiprop=url|size|extmetadata&format=json`;
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

async function searchModelPhotos(query: string) {
  console.log(`\n=================== SEARCH: ${query} ===================`);
  const res = await fetchWikiJson(query);
  const items = res?.query?.search || [];
  console.log(`Found ${items.length} files`);
  const titles = items.map((i: any) => i.title).slice(0, 10);
  if (titles.length === 0) return;

  const infoRes = await getFileInfo(titles);
  const pages = infoRes?.query?.pages || {};
  for (const pid of Object.keys(pages)) {
    const page = pages[pid];
    const ii = page.imageinfo?.[0];
    if (ii) {
      console.log(`- ${page.title}`);
      console.log(`  URL: ${ii.url}`);
    }
  }
}

async function main() {
  await searchModelPhotos('Mitsubishi Outlander 2022 white');
  await searchModelPhotos('Toyota Corolla Cross white');
  await searchModelPhotos('Jeep Grand Cherokee WL white');
  await searchModelPhotos('Jetour Traveller T2');
  await searchModelPhotos('Toyota Hilux 2022 double cab');
}

main().catch(console.error);
