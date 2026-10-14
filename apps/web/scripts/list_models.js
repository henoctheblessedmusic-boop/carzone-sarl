const fs = require('fs');
const envContent = fs.readFileSync('.env', 'utf8');
const lines = envContent.split('\n');
let openaiKey = '';
for (const line of lines) {
  if (line.startsWith('OPENAI_API_KEY=')) {
    openaiKey = line.replace('OPENAI_API_KEY=', '').replace(/["'\r]/g, '').trim();
  }
}

async function listModels() {
  const res = await fetch('https://api.openai.com/v1/models', {
    headers: { Authorization: `Bearer ${openaiKey}` }
  });
  const data = await res.json();
  const models = data.data.map(m => m.id);
  console.log('Total models:', models.length);
  console.log('Sample models:', models.filter(m => m.includes('gpt') || m.includes('dall') || m.includes('image')));
}

listModels();
