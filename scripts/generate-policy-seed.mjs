import { mkdir, writeFile } from "node:fs/promises";
import { LEGAL_POLICIES } from "../src/data/legalPolicies.js";

const sqlString = (value) => `'${String(value ?? "").replaceAll("'", "''")}'`;
const now = Date.now();
const lines = [
  "-- Generated from src/data/legalPolicies.js.",
  ...Object.entries(LEGAL_POLICIES).map(([slug, policy]) =>
    `INSERT OR REPLACE INTO legal_pages (slug, label, title, intro, sections, updated_at) VALUES (${sqlString(slug)}, ${sqlString(policy.label)}, ${sqlString(policy.title)}, ${sqlString(policy.intro)}, ${sqlString(JSON.stringify(policy.sections))}, ${now});`,
  ),
  "",
];

await mkdir("migrations", { recursive: true });
await writeFile("migrations/0003_legal_pages.sql", lines.join("\n"), "utf8");
console.log(`Generated ${Object.keys(LEGAL_POLICIES).length} legal policy records.`);
