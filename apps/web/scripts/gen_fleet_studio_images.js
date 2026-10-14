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
  console.log(`[START] Generating ${filename}...`);

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
      console.error(`[FAIL] ${filename}: HTTP ${res.status} - ${err}`);
      return false;
    }

    const data = await res.json();
    const b64 = data.data?.[0]?.b64_json;
    if (b64) {
      const buffer = Buffer.from(b64, 'base64');
      fs.writeFileSync(targetPath, buffer);
      console.log(`[DONE] Saved ${filename} (${buffer.length} bytes)`);
      return true;
    } else if (data.data?.[0]?.url) {
      const imgRes = await fetch(data.data[0].url);
      const arrBuffer = await imgRes.arrayBuffer();
      fs.writeFileSync(targetPath, Buffer.from(arrBuffer));
      console.log(`[DONE] Downloaded ${filename}`);
      return true;
    } else {
      console.error(`[FAIL] No image data returned for ${filename}`);
      return false;
    }
  } catch (err) {
    clearTimeout(timer);
    console.error(`[ERROR] ${filename}:`, err.message);
    return false;
  }
}

const TASKS = [
  // 1. CHANGAN CS75 (Blanc Nacré)
  {
    filename: 'cs75-main.jpg',
    prompt: 'Professional automotive studio photography of a brand new Changan CS75 Plus SUV in pristine Pearl White paint. Front three-quarter angle on white cyclorama studio floor, sleek LED headlights, red sport accent grille. Brand new showroom car, NO civilian license plate (clean black manufacturer plate holder), crisp 4:3 framing, luxury dealership lighting.'
  },
  {
    filename: 'cs75-interior.jpg',
    prompt: 'Interior photography of brand new Changan CS75 Plus digital cockpit. Dual horizontal digital instrument screens, sporty flat-bottom leather steering wheel, yacht-style electronic gear selector, ambient LED glow, premium dark leather trim. Brand new car showroom condition, crisp 4:3 framing, no human.'
  },
  {
    filename: 'cs75-seats.jpg',
    prompt: 'Interior photography of brand new luxury sporty leather seats in Changan CS75 Plus. Two-tone red and black perforated leather, deep side bolsters, contrast stitching, pristine brand new vehicle interior, 4:3 ratio framing, showroom lighting.'
  },
  {
    filename: 'cs75-exterior.jpg',
    prompt: 'Studio photography of side profile of brand new Changan CS75 Plus SUV in matching Pearl White paint. Polished dual-tone alloy wheels, tinted privacy glass, crisp white studio background, pristine factory fresh condition, 4:3 framing.'
  },
  {
    filename: 'cs75-rear.jpg',
    prompt: 'Automotive studio photography of the rear three-quarter view of a brand new Changan CS75 Plus SUV in matching Pearl White paint. Full-width horizontal LED lightbar, sporty roof spoiler, quad exhaust tips, white studio cyclorama floor, NO civilian license plate, crisp 4:3 framing.'
  },

  // 2. CHANGAN CS35 PLUS (Blanc Nacré avec liseré rouge)
  {
    filename: 'cs35-main.jpg',
    prompt: 'Automotive studio photography of a brand new compact SUV Changan CS35 Plus in Pearl White with sporty red underline trim. Front three-quarter view on white cyclorama studio floor, geometric matrix grille, NO civilian license plate, brand new showroom condition, 4:3 framing.'
  },
  {
    filename: 'cs35-interior.jpg',
    prompt: 'Interior photography of brand new Changan CS35 Plus modern cockpit. 10.25-inch connected touchscreen, sporty D-cut multifunction steering wheel, brushed aluminum vents, clean brand new interior, 4:3 framing, no human.'
  },
  {
    filename: 'cs35-seats.jpg',
    prompt: 'Interior photography of brand new ergonomic leather seats in Changan CS35 Plus. Black synthetic leather with red sporty contrast piping, brand new condition, 4:3 ratio, soft dealership lighting.'
  },
  {
    filename: 'cs35-exterior.jpg',
    prompt: 'Side profile studio view of brand new Changan CS35 Plus in matching Pearl White paint with red lower body stripe, sporty 18-inch wheels, white studio cyclorama background, 4:3 framing.'
  },
  {
    filename: 'cs35-rear.jpg',
    prompt: 'Studio photography of rear three-quarter view of brand new Changan CS35 Plus in matching Pearl White. Continuous LED taillight strip, dual chrome exhaust outlets, white studio floor, NO civilian license plate, crisp 4:3 framing.'
  },

  // 3. JETOUR DASHING (Rouge Carmin Showroom)
  {
    filename: 'dashing-main.jpg',
    prompt: 'Automotive studio photography of a brand new Jetour Dashing SUV in metallic Ruby Red paint. Front three-quarter angle on white cyclorama studio floor, sharp split LED daytime running lights, frameless grille. Brand new car, NO civilian license plate (glossy black plate with DASHING logo), 4:3 framing.'
  },
  {
    filename: 'dashing-interior.jpg',
    prompt: 'Interior photography of brand new futuristic Jetour Dashing cockpit. Huge 15.6-inch floating central touchscreen, two-spoke sport steering wheel, ambient light strips, minimalist floating center console. Brand new factory fresh, 4:3 framing, no human.'
  },
  {
    filename: 'dashing-seats.jpg',
    prompt: 'Interior photography of brand new integrated luxury sport bucket seats in Jetour Dashing. White and grey premium leather with red stitching, integrated headrest with built-in audio speakers, brand new luxury cabin, 4:3 framing.'
  },
  {
    filename: 'dashing-exterior.jpg',
    prompt: 'Side profile studio photography of brand new Jetour Dashing in matching metallic Ruby Red paint. Flush pop-out electric door handles, fastback coupe SUV roofline, 20-inch blade wheels, white studio floor, 4:3 framing.'
  },
  {
    filename: 'dashing-rear.jpg',
    prompt: 'Rear three-quarter studio photography of brand new Jetour Dashing in matching metallic Ruby Red. Aggressive checkered flag LED taillights, rear aerodynamic diffuser, white studio cyclorama floor, NO civilian license plate, crisp 4:3 framing.'
  },

  // 4. BAIC B40 PRO (Military Khaki Green)
  {
    filename: 'b40-main.jpg',
    prompt: 'Automotive studio photography of a brand new BAIC BJ40 Pro rugged 4x4 SUV in Military Khaki Green paint. Front three-quarter angle on clean white cyclorama studio floor, five-slot chrome grille with LED halos, red tow hooks, NO civilian license plate, showroom pristine condition, 4:3 framing.'
  },
  {
    filename: 'b40-interior.jpg',
    prompt: 'Interior photography of brand new BAIC BJ40 Pro 4x4 rugged luxury cockpit. Digital gauge cluster, round chrome aircraft air vents, floating central touchscreen, drive mode selector dial. Brand new vehicle, 4:3 framing, no human.'
  },
  {
    filename: 'b40-seats.jpg',
    prompt: 'Interior photography of brand new heavy-duty luxury leather seats in BAIC BJ40 Pro. Perforated black leather with embroidered BJ40 logo, contrast green stitching, 4:3 framing, dealership showroom lighting.'
  },
  {
    filename: 'b40-exterior.jpg',
    prompt: 'Side profile studio photography of brand new BAIC BJ40 Pro in matching Military Khaki Green. Removable modular hardtop roof, flared wheel arches, all-terrain tires, white studio floor, 4:3 framing.'
  },
  {
    filename: 'b40-rear.jpg',
    prompt: 'Rear three-quarter studio photography of brand new BAIC BJ40 Pro in matching Military Khaki Green. Full-size exterior mounted spare tire, vertical LED taillights, white studio cyclorama floor, NO civilian license plate, crisp 4:3 framing.'
  },

  // 5. CHANGAN UNI-K (Gris Titane)
  {
    filename: 'unik-main.jpg',
    prompt: 'Automotive studio photography of a brand new Changan UNI-K flagship crossover in Titanium Grey metallic paint. Front three-quarter view, vision-V parametric borderless grille, matrix LED headlights, clean white studio floor, NO civilian license plate, 4:3 framing.'
  },
  {
    filename: 'unik-interior.jpg',
    prompt: 'Interior photography of brand new Changan UNI-K futuristic cockpit. 3+1 quad digital screens layout, flat-top flat-bottom oval racing steering wheel, Sony audio system, pristine brand new luxury cabin, 4:3 framing, no human.'
  },
  {
    filename: 'unik-seats.jpg',
    prompt: 'Interior photography of brand new Zero Gravity Nappa leather seats in Changan UNI-K. Luxurious cognac brown leather, diamond quilting, headrest with built-in surround sound speakers, 4:3 framing, showroom lighting.'
  },
  {
    filename: 'unik-exterior.jpg',
    prompt: 'Side profile studio photography of brand new Changan UNI-K in matching Titanium Grey metallic. Retractable electric door handles, sweeping coupe roofline, 21-inch alloy wheels, white cyclorama floor, 4:3 framing.'
  },
  {
    filename: 'unik-rear.jpg',
    prompt: 'Rear three-quarter studio view of brand new Changan UNI-K in matching Titanium Grey. Dual twin round chrome exhausts, airship twin rear roof spoilers, continuous LED lightbar, white studio floor, NO civilian license plate, 4:3 framing.'
  },

  // 6. JETOUR T2 (Sable / Desert Bronze)
  {
    filename: 't2-main.jpg',
    prompt: 'Automotive studio photography of a brand new Jetour T2 rugged 4x4 SUV in Desert Sand Matte Bronze. Front three-quarter view on white cyclorama studio floor, illuminated JETOUR block letters on grille, square matrix LED headlights, NO civilian license plate, 4:3 framing.'
  },
  {
    filename: 't2-interior.jpg',
    prompt: 'Interior photography of brand new Jetour T2 adventure cockpit. 15.6-inch ultra-clear screen, rugged leather grab handles, mechanical style gear shifter, Qualcomm Snapdragon 8155 cockpit, brand new showroom condition, 4:3 framing, no human.'
  },
  {
    filename: 't2-seats.jpg',
    prompt: 'Interior photography of brand new rugged luxury leather and suede seats in Jetour T2. High bolster ergonomic sport off-road seats, dual tone leather, 4:3 framing, clean studio lighting.'
  },
  {
    filename: 't2-exterior.jpg',
    prompt: 'Side profile studio photography of brand new Jetour T2 in matching Desert Sand Matte Bronze paint. Boxy off-road silhouette, roof rack rails, side steps, all-terrain tires, white studio floor, 4:3 framing.'
  },
  {
    filename: 't2-rear.jpg',
    prompt: 'Rear three-quarter studio photography of brand new Jetour T2 in matching Desert Sand Matte Bronze. Squared external cargo backpack on rear door, vertical segmented LED taillights, white studio floor, NO civilian license plate, 4:3 framing.'
  },

  // 7. FORTHING T5 EVO (Cyber Lime / Jaune Sport)
  {
    filename: 't5evo-main.jpg',
    prompt: 'Automotive studio photography of a brand new Forthing T5 EVO SUV in Bright Cyber Lime metallic paint. Front three-quarter view on white studio cyclorama floor, aggressive black fang grille, split LED lights, NO civilian license plate, brand new showroom, 4:3 framing.'
  },
  {
    filename: 't5evo-interior.jpg',
    prompt: 'Interior photography of brand new Forthing T5 EVO cockpit. Dual connected 10.25-inch widescreen displays, circular aircraft turbine air vents, leather wrapped flat-bottom steering wheel, brand new condition, 4:3 framing, no human.'
  },
  {
    filename: 't5evo-seats.jpg',
    prompt: 'Interior photography of brand new sports bucket seats in Forthing T5 EVO. Premium black leather with neon lime contrast stitching, embroidered lion emblem, 4:3 framing, dealership showroom lighting.'
  },
  {
    filename: 't5evo-exterior.jpg',
    prompt: 'Side profile studio photography of brand new Forthing T5 EVO in matching Bright Cyber Lime paint. Sleek aerodynamic coupe-SUV line, black gloss 19-inch wheels, white studio cyclorama floor, 4:3 framing.'
  },
  {
    filename: 't5evo-rear.jpg',
    prompt: 'Rear three-quarter studio photography of brand new Forthing T5 EVO in matching Bright Cyber Lime. Quad round exhaust tailpipes, full-width smoked LED taillight bar, white studio floor, NO civilian license plate, 4:3 framing.'
  },

  // 8. GEELY STARSHIP 7 (Bleu Ciel Céleste)
  {
    filename: 'starship7-main.jpg',
    prompt: 'Automotive studio photography of a brand new Geely Galaxy Starship 7 PHEV SUV in Celestial Sky Blue paint. Front three-quarter angle on white cyclorama studio floor, enclosed aerodynamic front fascia with LED light bar, NO civilian license plate, 4:3 framing.'
  },
  {
    filename: 'starship7-interior.jpg',
    prompt: 'Interior photography of brand new Geely Galaxy Starship 7 cockpit. High-resolution floating central screen, Flyme Auto system, two-tone minimalist luxury dashboard, wireless charging dock, ambient light bar, brand new condition, 4:3 framing, no human.'
  },
  {
    filename: 'starship7-seats.jpg',
    prompt: 'Interior photography of brand new cloud-cushion ergonomic leather seats in Geely Galaxy Starship 7. Cream white and soft grey Nappa leather, 4:3 framing, soft studio lighting.'
  },
  {
    filename: 'starship7-exterior.jpg',
    prompt: 'Side profile studio photography of brand new Geely Galaxy Starship 7 in matching Celestial Sky Blue paint. Flowing shoulder line, aero alloy wheels, white cyclorama studio background, 4:3 framing.'
  },
  {
    filename: 'starship7-rear.jpg',
    prompt: 'Rear three-quarter studio photography of brand new Geely Galaxy Starship 7 in matching Celestial Sky Blue. Full-width ripple LED taillight bar, clean aerodynamic rear bumper, white studio floor, NO civilian license plate, 4:3 framing.'
  }
];

async function run() {
  console.log(`Starting generation of ${TASKS.length} clean studio assets...`);
  let successCount = 0;
  for (const t of TASKS) {
    const ok = await generateAndSave(t.prompt, t.filename);
    if (ok) successCount++;
    // Small pause between generations to avoid rate limit
    await new Promise(r => setTimeout(r, 2000));
  }
  console.log(`Finished generation! Success: ${successCount} / ${TASKS.length}`);
}

run();
