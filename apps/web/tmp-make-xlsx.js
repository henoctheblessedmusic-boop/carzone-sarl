const XLSX = require("xlsx");
const rows = [
  ["Nom du contact", "Société", "E-mail", "Téléphone", "Ville"],
  ["Import Test Un", "Test SARL", "import.test1@example.com", "+229 01 90 00 00 01", "Cotonou"],
  ["Import Test Deux", "", "import.test2@example.com", "+229 01 90 00 00 02", "Porto-Novo"],
  ["Import Test Un Doublon", "Test SARL", "import.test1@example.com", "+229 01 90 00 00 01", "Cotonou"],
];
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), "Clients");
XLSX.writeFile(wb, process.argv[2]);
console.log("written", process.argv[2]);
