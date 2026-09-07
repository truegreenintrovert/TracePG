import { mkdir, writeFile } from "node:fs/promises";
import { QUESTIONS } from "../src/data/questions.js";
import { YEAR_PYQS } from "../src/data/yearPyqs.js";
import { normalizeSubject } from "../src/lib/subjects.js";

const sqlString = (value) => `'${String(value ?? "").replaceAll("'", "''")}'`;
const json = (value) => sqlString(JSON.stringify(value));

const lines = [
  "-- Generated from src/data/questions.js and src/data/yearPyqs.js.",
  ...QUESTIONS.map(
    (question, index) =>
      `INSERT OR REPLACE INTO questions (id, subject, chapter, difficulty, source, source_no, data) VALUES (${index + 1}, ${sqlString(normalizeSubject(question.subject))}, ${sqlString(question.chapter)}, ${sqlString(question.difficulty)}, ${sqlString(question.source)}, ${question.sourceNo == null ? "NULL" : question.sourceNo}, ${json({ ...question, subject: normalizeSubject(question.subject) })});`,
  ),
  ...YEAR_PYQS.map(
    (question, index) =>
      `INSERT OR REPLACE INTO pyq_questions (id, year, question_no, subject, source_file, data) VALUES (${index + 1}, ${sqlString(question.year)}, ${question.no == null ? "NULL" : question.no}, ${sqlString(normalizeSubject(question.subject))}, ${sqlString(question.source_file)}, ${json({ ...question, subject: normalizeSubject(question.subject) })});`,
  ),
  "",
];

await mkdir("migrations", { recursive: true });
await writeFile("migrations/0002_questions.sql", lines.join("\n"), "utf8");
console.log(`Generated ${QUESTIONS.length} questions and ${YEAR_PYQS.length} PYQs.`);
