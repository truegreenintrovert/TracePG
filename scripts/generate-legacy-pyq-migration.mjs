import { readFile, writeFile } from "node:fs/promises";

const source = await readFile("legacy/MedPrepAI.html", "utf8");
const marker = "const YEAR_PYQS=";
const start = source.indexOf(marker) + marker.length;
if (start < marker.length) throw new Error("YEAR_PYQS was not found in the legacy file.");

let depth = 0;
let inString = false;
let escaped = false;
let end = -1;
for (let index = start; index < source.length; index += 1) {
  const character = source[index];
  if (inString) {
    if (escaped) escaped = false;
    else if (character === "\\") escaped = true;
    else if (character === '"') inString = false;
    continue;
  }
  if (character === '"') inString = true;
  else if (character === "[") depth += 1;
  else if (character === "]") {
    depth -= 1;
    if (depth === 0) {
      end = index + 1;
      break;
    }
  }
}
if (end < 0) throw new Error("YEAR_PYQS array was not complete.");

const legacyItems = JSON.parse(source.slice(start, end));
const includedYears = new Set(["2022", "2024", "2025"]);
const items = legacyItems.filter((item) => includedYears.has(String(item.year)));
const sqlString = (value) => `'${String(value ?? "").replaceAll("'", "''")}'`;
const now = Date.now();
const lines = [
  "-- Imported from legacy/MedPrepAI.html. Years absent from the original D1 import.",
  ...items.map((item, index) => {
    const data = {
      no: Number(item.no || index + 1),
      q: String(item.q || "").trim(),
      o: Array.isArray(item.o) ? item.o : ["", "", "", ""],
      a: Number(item.a || 0),
      year: String(item.year),
      paper: item.paper || String(item.year),
      source_file: item.source_file || `NEET_PG_${item.year}.pdf`,
      image_based: Boolean(item.image_based),
    };
    const id = 20000000 + index;
    return `INSERT OR IGNORE INTO pyq_questions (id, year, question_no, subject, source_file, data) VALUES (${id}, ${sqlString(data.year)}, ${Number.isFinite(data.no) ? data.no : "NULL"}, NULL, ${sqlString(data.source_file)}, ${sqlString(JSON.stringify(data))});`;
  }),
  `-- Imported ${items.length} questions at ${new Date(now).toISOString()}.`,
  "",
];

await writeFile("migrations/0006_legacy_years.sql", lines.join("\n"), "utf8");
const counts = Object.fromEntries([...includedYears].map((year) => [year, items.filter((item) => String(item.year) === year).length]));
console.log(JSON.stringify({ counts, total: items.length, output: "migrations/0006_legacy_years.sql" }, null, 2));
