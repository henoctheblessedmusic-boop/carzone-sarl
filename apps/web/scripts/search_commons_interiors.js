async function searchCommons(query) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&format=json&srlimit=10`;
  const res = await fetch(url, { headers: { 'User-Agent': 'CarzoneApp/1.0' } });
  const data = await res.json();
  console.log(`=== Query: ${query} ===`);
  data.query?.search?.forEach(s => console.log(' - ' + s.title));
}

async function run() {
  await searchCommons('Changan UNI-K interior');
  await searchCommons('Jetour Traveller interior');
  await searchCommons('Jetour T2 interior');
  await searchCommons('Forthing T5 EVO interior');
  await searchCommons('Geely Galaxy Starship 7 interior');
}

run();
