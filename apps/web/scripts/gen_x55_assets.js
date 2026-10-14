const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync('.env', 'utf8');
const lines = envContent.split('\n');
let key = '';
for (const line of lines) {
  if (line.startsWith('OPENAI_API_KEY=')) {
    key = line.replace('OPENAI_API_KEY=', '').replace(/["'\r]/g, '').trim();
  }
}

const TARGET_DIR = path.join(__dirname, '..', 'public', 'images', 'vehicles');

async function generateAndSave(prompt, filename) {
  const targetPath = path.join(TARGET_DIR, filename);
  console.log(`Generating ${filename}...`);
  console.log(`Prompt: ${prompt}`);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90000);

  try {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: prompt,
        size: '1024x1024'
      }),
      signal: controller.signal
    });

    clearTimeout(timer);

    if (!res.ok) {
      const err = await res.text();
      console.error(`Failed ${filename}: HTTP ${res.status} - ${err}`);
      return false;
    }

    const data = await res.json();
    const b64 = data.data?.[0]?.b64_json;
    if (b64) {
      const buffer = Buffer.from(b64, 'base64');
      fs.writeFileSync(targetPath, buffer);
      console.log(`SUCCESS: Saved ${filename} (${buffer.length} bytes)`);
      return true;
    } else if (data.data?.[0]?.url) {
      const imgRes = await fetch(data.data[0].url);
      const arrBuffer = await imgRes.arrayBuffer();
      fs.writeFileSync(targetPath, Buffer.from(arrBuffer));
      console.log(`SUCCESS: Downloaded ${filename}`);
      return true;
    } else {
      console.error(`No image data returned for ${filename}`);
      return false;
    }
  } catch (err) {
    clearTimeout(timer);
    console.error(`Error generating ${filename}:`, err.message);
    return false;
  }
}

async function run() {
  // 1. BAIC X55 Interior Cockpit (Page 2)
  await generateAndSave(
    'Interior photography of a brand new BAIC X55 Beijing Mofang modern SUV cockpit. Modern digital cockpit dashboard, 10.1-inch central touchscreen, futuristic D-shaped steering wheel, LED ambient lighting, minimalist center console, luxury black leather trim. Clean studio automotive photography, brand new showroom condition, 4:3 ratio framing, crisp ultra high definition, no human, no watermark.',
    'x55-interior.jpg'
  );

  // 2. BAIC X55 Luxury Leather Seats (Page 2 second photo)
  await generateAndSave(
    'Interior photography of brand new luxury sporty leather bucket seats in a BAIC X55 SUV. Premium perforated leather, ergonomic bolsters, contrast neon stitching, pristine new car interior, luxury car dealership showroom lighting, 4:3 ratio framing, no human, crisp details.',
    'x55-seats.jpg'
  );

  // 3. BAIC X55 Cyber Yellow Rear 3/4 (Matching Page 1 yellow car, 0 civilian plate)
  await generateAndSave(
    'Automotive studio photography of the rear three-quarter view of a brand new BAIC X55 Beijing Mofang SUV in vibrant Cyber Yellow paint with black contrasting floating roof. Sleek continuous LED taillight bar, rear roof spoiler, clean studio white cyclorama floor, no civilian license plate (blank glossy black plate holder or Beijing logo plate), brand new factory condition, crisp 4:3 framing.',
    'x55-rear.jpg'
  );
}

run();
