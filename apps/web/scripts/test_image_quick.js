const fs = require('fs');
const envContent = fs.readFileSync('.env', 'utf8');
const lines = envContent.split('\n');
let key = '';
for (const line of lines) {
  if (line.startsWith('OPENAI_API_KEY=')) {
    key = line.replace('OPENAI_API_KEY=', '').replace(/["'\r]/g, '').trim();
  }
}

async function test() {
  console.log('Sending request to gpt-image-1 with 60s timeout...');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60000);
  try {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-image-1', prompt: 'Luxury car digital cockpit interior', size: '1024x1024' }),
      signal: controller.signal
    });
    console.log('Status:', res.status);
    const txt = await res.text();
    console.log('Response:', txt.slice(0, 500));
  } catch (e) {
    console.log(e.name, e.message);
  } finally {
    clearTimeout(timer);
  }
}

test();
