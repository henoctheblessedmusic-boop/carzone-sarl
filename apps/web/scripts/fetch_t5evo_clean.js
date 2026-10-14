const fs = require('fs');
const path = require('path');

const TARGET_DIR = path.join(__dirname, '..', 'public', 'images', 'vehicles');

async function downloadCommons(filename, commonsFile) {
  const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(commonsFile)}&prop=imageinfo&iiprop=url&format=json`;
  const res = await fetch(apiUrl, { headers: { 'User-Agent': 'CarzoneAutomotiveBot/2.0 (contact@topcarzone.com)' } });
  const data = await res.json();
  const pages = data?.query?.pages;
  let url = null;
  for (const k in pages) {
    if (pages[k]?.imageinfo?.[0]?.url) {
      url = pages[k].imageinfo[0].url;
      break;
    }
  }
  if (!url) {
    console.error(`Not found: ${commonsFile}`);
    return false;
  }
  console.log(`Downloading ${commonsFile} -> ${filename}...`);
  const imgRes = await fetch(url, { headers: { 'User-Agent': 'CarzoneAutomotiveBot/2.0 (contact@topcarzone.com)' } });
  if (!imgRes.ok) {
    console.error(`Fetch failed for ${url}: ${imgRes.status}`);
    return false;
  }
  const buffer = Buffer.from(await imgRes.arrayBuffer());
  fs.writeFileSync(path.join(TARGET_DIR, filename), buffer);
  console.log(`Saved ${filename} (${buffer.length} bytes)`);
  return true;
}

async function run() {
  // Dongfeng Forthing 5 at Auto Show (100% Brand new, no civilian plate)
  await downloadCommons('t5evo-main.jpg', 'Dongfeng Forthing 5 1X7A7308.jpg');
  await downloadCommons('t5evo-exterior.jpg', 'Dongfeng Forthing 5 1X7A7308.jpg');
  await downloadCommons('t5evo-rear.jpg', 'Dongfeng Forthing 5 1X7A7316.jpg');

  // Interior & Seats: Let's find real clean interior of Forthing T5 EVO
  await downloadCommons('t5evo-interior.jpg', 'Forthing T5 Evo IMG008.jpg');
  await downloadCommons('t5evo-seats.jpg', 'Forthing T5 Evo IMG005.jpg');
}

run();
