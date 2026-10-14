const fs = require('fs');
const content = fs.readFileSync('src/lib/vehicle-catalog-specs.ts', 'utf8');

// Match all brand/model/photos blocks
const brandMatches = [...content.matchAll(/brand:\s*"([^"]+)",\s*model:\s*"([^"]+)"/g)];
console.log('Total catalog entries found:', brandMatches.length);
brandMatches.forEach(m => console.log(`Brand: ${m[1]}, Model: ${m[2]}`));
