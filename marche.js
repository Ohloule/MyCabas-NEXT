const fs = require("fs");
const marches = require("./marches.json");

console.log(`Nombre de marchés : ${marches.length}`);
const marches2 = fs.readFileSync("./marches.json", "utf8");
console.log("Nombre de caractère : ", marches2.length);
