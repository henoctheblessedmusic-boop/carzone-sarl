async function searchCommons(query) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&format=json&srlimit=15`;
  const res = await fetch(url, { headers: { 'User-Agent': 'CarzoneAutomotiveBot/2.0' } });
  const data = await res.json();
  console.log(`=== Query: ${query} ===`);
  data.query?.search?.forEach(s => console.log(' - ' + s.title));
}

async function run() {
  await searchCommons('Geely Galaxy Starship 7');
  await searchCommons('Jetour Traveller');
}

run();
