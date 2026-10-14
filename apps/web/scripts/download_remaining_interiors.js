const fs = require('fs');
const path = require('path');

const TARGET_DIR = path.join(__dirname, '..', 'public', 'images', 'vehicles');

async function downloadCommons(filename, commonsFile) {
  const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(commonsFile)}&prop=imageinfo&iiprop=url&format=json`;
  const res = await fetch(apiUrl, { headers: { 'User-Agent': 'CarzoneApp/1.0' } });
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
  const imgRes = await fetch(url, { headers: { 'User-Agent': 'CarzoneApp/1.0' } });
  const buffer = Buffer.from(await imgRes.arrayBuffer());
  fs.writeFileSync(path.join(TARGET_DIR, filename), buffer);
  console.log(`Saved ${filename} (${buffer.length} bytes)`);
  return true;
}

async function run() {
  await downloadCommons('t2-interior.jpg', 'Jetour T2 interior.jpg');
  await downloadCommons('t2-seats.jpg', 'Jetour T2 2.0T Beyond XWD interior.jpg');
  await downloadCommons('t5evo-interior.jpg', 'Forthing T5 EVO 009.jpg');
  await downloadCommons('t5evo-seats.jpg', 'Forthing T5 EVO 009.jpg');
}

run();
