import { useState } from "react";
import { adminFetch } from "../lib/adminApi";

export default function BulkQuestionUpload({ onUploaded }) {
  const [type, setType] = useState("questions");
  const [bulkYear, setBulkYear] = useState(new Date().getFullYear().toString());
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [errors, setErrors] = useState([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const chooseFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setMessage("");
    setErrors([]);
    setRows([]);
    setFileName(file.name);
    try {
      const extension = file.name.split(".").pop()?.toLowerCase();
      const parsed = extension === "pdf" ? await parsePdf(file) : await parseSpreadsheet(file);
      setRows(parsed.rows);
      setErrors(parsed.errors);
      setMessage(parsed.rows.length ? `Ready to upload ${parsed.rows.length} questions.` : "No valid questions were found.");
    } catch (error) {
      setErrors([error.message || "Unable to read this file."]);
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  };

  const upload = async () => {
    if (!rows.length) return;
    setBusy(true);
    setMessage("");
    try {
      const result = await adminFetch("/api/admin/questions", {
        method: "POST",
        body: JSON.stringify({ type, questions: type === "pyqs" ? rows.map((row, index) => ({ ...row, year: row.year || bulkYear, no: row.no || index + 1 })) : rows }),
      });
      setMessage(`${result.inserted} ${type === "pyqs" ? "PYQs" : "questions"} added successfully.`);
      setRows([]);
      setFileName("");
      await onUploaded?.();
    } catch (error) {
      setErrors([error.message]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="surface-card space-y-5">
      <div>
        <h2 className="text-lg font-extrabold">Bulk question upload</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          Upload an Excel, CSV, or text-based PDF. Scanned/image-only PDFs require OCR and cannot be read directly here.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-bold">Upload as
          <select className="field mt-2" value={type} onChange={(event) => setType(event.target.value)}>
            <option value="questions">Main question bank</option>
            <option value="pyqs">PYQ papers</option>
          </select>
        </label>
        <label className="text-sm font-bold">Choose file
          <input className="field mt-2" type="file" accept=".xlsx,.csv,.pdf" onChange={chooseFile} disabled={busy} />
        </label>
        {type === "pyqs" && <label className="text-sm font-bold">Default PYQ year
          <input className="field mt-2" value={bulkYear} onChange={(event) => setBulkYear(event.target.value)} placeholder="2026" />
        </label>}
      </div>

      <div className="rounded-xl bg-blue-50 p-4 text-sm leading-6 text-blue-900 dark:bg-blue-950/30 dark:text-blue-100">
        <b>Required in every row:</b> <code>q, o1, o2, o3, o4, a</code>. All other CSV/Excel fields are optional and can be left blank. Main-bank fields: <code>subject, chapter, difficulty, source, sourceNo, e</code>. PYQ fields: <code>year, no, subject, source_file, paper, image_based, e</code>. For PYQs, a blank <code>year</code> uses the Default PYQ year above. Answer <code>a</code> can be A-D, 1-4, or 0-3.
      </div>
      <div className="flex flex-wrap gap-3 text-sm font-bold">
        <a className="secondary-button" href="/templates/tracepg-main-questions.csv" download>⬇ Main question CSV</a>
        <a className="secondary-button" href="/templates/tracepg-pyq-questions.csv" download>⬇ PYQ CSV</a>
        <a className="secondary-button" href="/templates/tracepg-pdf-format.txt" download>⬇ PDF format guide</a>
      </div>

      {fileName && <p className="text-sm font-semibold text-slate-500">File: {fileName}</p>}
      {message && <p className="rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">{message}</p>}
      {errors.length > 0 && <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200"><b>Review these parsing warnings:</b><ul className="mt-2 list-disc space-y-1 pl-5">{errors.slice(0, 10).map((error, index) => <li key={index}>{error}</li>)}</ul>{errors.length > 10 && <p className="mt-2">+ {errors.length - 10} more warnings</p>}</div>}

      {rows.length > 0 && <>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="min-w-full text-left text-xs"><thead className="bg-slate-50 dark:bg-slate-800"><tr><th className="px-3 py-2">#</th><th className="px-3 py-2">Question</th><th className="px-3 py-2">Options</th><th className="px-3 py-2">Answer</th><th className="px-3 py-2">Subject / Year</th></tr></thead><tbody>{rows.slice(0, 8).map((row, index) => <tr className="border-t border-slate-100 dark:border-slate-800" key={index}><td className="px-3 py-2">{index + 1}</td><td className="max-w-sm px-3 py-2 font-semibold">{row.q}</td><td className="px-3 py-2">{row.o.join(" · ")}</td><td className="px-3 py-2">{String.fromCharCode(65 + Number(row.a))}</td><td className="px-3 py-2">{row.subject || row.year || "—"}</td></tr>)}</tbody></table>
        </div>
        {rows.length > 8 && <p className="text-xs font-semibold text-slate-400">Showing the first 8 of {rows.length} rows.</p>}
        <button className="primary-button" onClick={upload} disabled={busy}>{busy ? "Uploading…" : `Upload ${rows.length} questions to D1`}</button>
      </>}
    </section>
  );
}

async function parseSpreadsheet(file) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  const matrix = extension === "csv"
    ? parseCsv(await file.text())
    : await (await import("read-excel-file/browser")).default(file);
  if (!matrix.length) return { rows: [], errors: ["The spreadsheet is empty."] };
  const headers = matrix[0].map((header, index) => String(header || `column${index + 1}`));
  const rows = matrix.slice(1).map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])));
  return normalizeRows(rows);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"' && text[index + 1] === '"' && quoted) {
      cell += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => String(value).trim())) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }
  row.push(cell);
  if (row.some((value) => String(value).trim())) rows.push(row);
  return rows;
}

async function parsePdf(file) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const worker = await import("pdfjs-dist/legacy/build/pdf.worker.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  const document = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const lines = [];
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    const grouped = new Map();
    content.items.forEach((item) => {
      const y = Math.round(item.transform[5]);
      grouped.set(y, `${grouped.get(y) || ""} ${item.str}`.trim());
    });
    lines.push(...[...grouped.entries()].sort((a, b) => b[0] - a[0]).map(([, value]) => value));
  }
  return normalizePdf(lines);
}

function normalizeRows(inputRows) {
  const rows = [];
  const errors = [];
  inputRows.slice(0, 1000).forEach((row, index) => {
    const get = (...names) => {
      const key = Object.keys(row).find((item) => names.includes(normalizeHeader(item)));
      return key ? row[key] : "";
    };
    const options = [get("o1", "optiona", "option1", "aoption"), get("o2", "optionb", "option2", "boption"), get("o3", "optionc", "option3", "coption"), get("o4", "optiond", "option4", "doption")].map(String);
    const question = {
      q: String(get("q", "question", "questiontext", "question_text")).trim(),
      o: options,
      a: answerIndex(get("a", "answer", "correct", "correctanswer"), options),
      e: String(get("e", "explanation", "solution")).trim(),
      subject: String(get("subject")).trim(),
      chapter: String(get("chapter", "topic")).trim(),
      difficulty: String(get("difficulty", "level")).trim() || "Moderate",
      source: String(get("source")).trim(),
      sourceNo: get("sourceno", "sourcenumber"),
      year: String(get("year")).trim(),
      no: get("no", "number", "questionno", "questionnumber"),
      source_file: String(get("sourcefile", "filename", "paper")).trim(),
      paper: String(get("paper")).trim(),
      image_based: /^(true|1|yes|y)$/i.test(String(get("imagebased", "image")).trim()),
    };
    const problem = validateQuestion(question, index + 1);
    if (problem) errors.push(problem);
    else rows.push(question);
  });
  if (inputRows.length > 1000) errors.push("Only the first 1,000 rows were prepared.");
  return { rows, errors };
}

function normalizePdf(lines) {
  const blocks = [];
  let current = null;
  let explanation = false;
  lines.forEach((line) => {
    const questionStart = line.match(/^\s*(?:question\s*)?(\d+)[.)]\s+(.+)/i);
    const option = line.match(/^\s*([A-D])[.)\-:]\s*(.+)/i);
    const answer = line.match(/^\s*(?:answer|ans|correct answer)\s*[:\-]?\s*([A-D1-4])/i);
    const explanationStart = line.match(/^\s*(?:explanation|solution)\s*[:\-]?\s*(.*)/i);
    if (questionStart) {
      if (current) blocks.push(current);
      current = { q: questionStart[2].trim(), o: [], a: undefined, e: "" };
      explanation = false;
    } else if (current && option && current.o.length < 4) {
      current.o.push(option[2].trim());
    } else if (current && answer) {
      current.a = answerIndex(answer[1], current.o);
      explanation = false;
    } else if (current && explanationStart) {
      current.e = explanationStart[1].trim();
      explanation = true;
    } else if (current && explanation) {
      current.e += ` ${line.trim()}`;
    } else if (current && current.o.length === 0) {
      current.q += ` ${line.trim()}`;
    }
  });
  if (current) blocks.push(current);
  return normalizeRows(blocks);
}

function normalizeHeader(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function answerIndex(value, options = []) {
  const text = String(value ?? "").trim().toUpperCase();
  const letter = text.match(/[A-D]/)?.[0];
  if (letter && /^[A-D]$/.test(text.replace(/[^A-D]/g, "").slice(0, 1))) return letter.charCodeAt(0) - 65;
  if (/^\s*0\s*$/.test(text)) return 0;
  const oneBased = Number(text.match(/[1-4]/)?.[0]);
  if (/^\s*[1-4]\s*$/.test(text)) return oneBased - 1;
  const match = options.findIndex((option) => option.trim().toUpperCase() === text);
  return match;
}

function validateQuestion(question, index) {
  if (!question.q) return `Row ${index}: question text is missing.`;
  if (question.o.length !== 4 || question.o.some((option) => !option.trim())) return `Row ${index}: four options are required.`;
  if (!Number.isInteger(question.a) || question.a < 0 || question.a > 3) return `Row ${index}: answer must be A-D, 1-4, or 0-3.`;
  return "";
}
