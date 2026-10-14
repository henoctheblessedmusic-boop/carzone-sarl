const fs = require('fs');
const envContent = fs.readFileSync('.env', 'utf8');
const lines = envContent.split('\n');
let openaiKey = '';
let deepseekKey = '';
for (const line of lines) {
  if (line.startsWith('OPENAI_API_KEY=')) {
    openaiKey = line.replace('OPENAI_API_KEY=', '').replace(/["'\r]/g, '').trim();
  }
  if (line.startsWith('DEEPSEEK_API_KEY=')) {
    deepseekKey = line.replace('DEEPSEEK_API_KEY=', '').replace(/["'\r]/g, '').trim();
  }
}

async function run() {
  console.log('OpenAI key length:', openaiKey.length);
  console.log('DeepSeek key length:', deepseekKey.length);

  try {
    const oRes = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${openaiKey}` }
    });
    console.log('OpenAI models response status:', oRes.status);
    if (!oRes.ok) {
      console.log('OpenAI err:', await oRes.text());
    }
  } catch (e) {
    console.error('OpenAI fetch error:', e);
  }

  try {
    const dRes = await fetch('https://api.deepseek.com/models', {
      headers: { Authorization: `Bearer ${deepseekKey}` }
    });
    console.log('DeepSeek models response status:', dRes.status);
    if (!dRes.ok) {
      console.log('DeepSeek err:', await dRes.text());
    }
  } catch (e) {
    console.error('DeepSeek fetch error:', e);
  }
}

run();
