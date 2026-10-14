const fs = require('fs');
const envContent = fs.readFileSync('.env', 'utf8');
const lines = envContent.split('\n');
let deepseekKey = '';
for (const line of lines) {
  if (line.startsWith('DEEPSEEK_API_KEY=')) {
    deepseekKey = line.replace('DEEPSEEK_API_KEY=', '').replace(/["'\r]/g, '').trim();
  }
}

async function testDeepSeek() {
  console.log('Testing DeepSeek chat completion for BAIC X55...');
  try {
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${deepseekKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'Tu es un expert automobile. Réponds en JSON valide.' },
          { role: 'user', content: 'Donne les specs officielles de la BAIC X55 (Beijing Mofang) en JSON: { title: string, power: string }' }
        ],
        response_format: { type: 'json_object' }
      })
    });
    console.log('DeepSeek Status:', res.status);
    const data = await res.json();
    console.log('DeepSeek Response:', data.choices?.[0]?.message?.content);
  } catch (err) {
    console.error('DeepSeek test error:', err);
  }
}

testDeepSeek();
