const fs = require('fs');
const envContent = fs.readFileSync('.env', 'utf8');
const lines = envContent.split('\n');
let openaiKey = '';
for (const line of lines) {
  if (line.startsWith('OPENAI_API_KEY=')) {
    openaiKey = line.replace('OPENAI_API_KEY=', '').replace(/["'\r]/g, '').trim();
  }
}

async function testImageModel(model) {
  console.log(`Testing model: ${model}...`);
  try {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        prompt: 'Luxury digital car interior cockpit with modern dashboard, leather steering wheel, studio lighting, brand new vehicle.',
        size: '1024x1024'
      })
    });
    console.log(`${model} status:`, res.status);
    const data = await res.json();
    if (res.ok) {
      console.log(`${model} SUCCESS URL:`, data.data[0].url);
      return true;
    } else {
      console.log(`${model} error:`, data.error?.message);
    }
  } catch (err) {
    console.error(err);
  }
  return false;
}

async function run() {
  for (const m of ['gpt-image-1', 'gpt-image-1-mini', 'dall-e-2', 'chatgpt-image-latest']) {
    const ok = await testImageModel(m);
    if (ok) break;
  }
}

run();
