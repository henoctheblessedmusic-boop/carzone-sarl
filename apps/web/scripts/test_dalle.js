const fs = require('fs');
const envContent = fs.readFileSync('.env', 'utf8');
const lines = envContent.split('\n');
let openaiKey = '';
for (const line of lines) {
  if (line.startsWith('OPENAI_API_KEY=')) {
    openaiKey = line.replace('OPENAI_API_KEY=', '').replace(/["'\r]/g, '').trim();
  }
}

async function testDalle() {
  console.log('Testing OpenAI DALL-E 3 generation...');
  try {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: 'Professional automotive studio photography of the interior cockpit and dashboard of a brand new BAIC X55 Beijing Mofang SUV. High-end modern digital touchscreen, futuristic steering wheel, ambient neon LED lighting, luxury leather upholstery. Clean showroom lighting, 4:3 aspect ratio framing, crisp details, no watermark, no text.',
        size: '1024x1024',
        n: 1,
        quality: 'standard'
      })
    });
    console.log('DALL-E response status:', res.status);
    const data = await res.json();
    if (res.ok) {
      console.log('DALL-E image URL:', data.data[0].url);
    } else {
      console.error('DALL-E error:', data);
    }
  } catch (err) {
    console.error('Error calling DALL-E:', err);
  }
}

testDalle();
