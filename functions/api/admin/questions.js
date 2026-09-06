import { getAdminUser, json } from "../_shared.js";

const MAX_BODY_BYTES = 5 * 1024 * 1024;
const MAX_QUESTIONS_PER_UPLOAD = 1000;

export async function onRequestGet({ request, env }) {
  const auth = await getAdminUser(request, env);
  if (auth.error) return auth.error;
  const result = await env.DB.batch([
    env.DB.prepare("SELECT COUNT(*) AS count FROM questions"),
    env.DB.prepare("SELECT COUNT(*) AS count FROM pyq_questions"),
  ]);
  return json({ questions: result[0].results[0].count, pyqs: result[1].results[0].count });
}

export async function onRequestPost({ request, env }) {
  const auth = await getAdminUser(request, env);
  if (auth.error) return auth.error;
  const length = Number(request.headers.get("content-length") || 0);
  if (length > MAX_BODY_BYTES) return json({ error: "Question payload is too large." }, 413);

  const body = await request.json().catch(() => null);
  const type = body?.type === "pyqs" ? "pyqs" : "questions";
  const questions = Array.isArray(body?.questions) ? body.questions : body?.question ? [body.question] : [];
  if (!questions.length) return json({ error: "At least one question is required." }, 400);
  if (questions.length > MAX_QUESTIONS_PER_UPLOAD) return json({ error: `Upload up to ${MAX_QUESTIONS_PER_UPLOAD} questions at a time.` }, 413);

  const table = type === "pyqs" ? "pyq_questions" : "questions";
  const current = await env.DB.prepare(`SELECT COALESCE(MAX(id), 0) + 1 AS nextId FROM ${table}`).first();
  const firstId = Number(current.nextId);
  const records = [];

  for (const [index, question] of questions.entries()) {
    if (!question || !question.q?.trim() || !Array.isArray(question.o) || question.o.length !== 4 || question.o.some((option) => !option?.trim())) {
      return json({ error: `Question ${index + 1} must have text and four options.` }, 400);
    }
    if (!Number.isInteger(Number(question.a)) || Number(question.a) < 0 || Number(question.a) > 3) {
      return json({ error: `Question ${index + 1} has an invalid correct option.` }, 400);
    }
    if (type === "pyqs" && !String(question.year || "").trim()) {
      return json({ error: `Question ${index + 1} is missing its PYQ year.` }, 400);
    }
    const id = firstId + index;
    const data = {
      ...question,
      ...(type === "questions" ? { id } : {}),
      q: question.q.trim(),
      o: question.o.map((option) => String(option).trim()),
      a: Number(question.a),
    };
    records.push({ id, question, data });
  }

  for (let offset = 0; offset < records.length; offset += 50) {
    const batch = records.slice(offset, offset + 50).map(({ id, question, data }) =>
      type === "pyqs"
        ? env.DB.prepare(
            "INSERT INTO pyq_questions (id, year, question_no, subject, source_file, data) VALUES (?, ?, ?, ?, ?, ?)",
          ).bind(id, String(question.year).trim(), Number(question.no) || id, question.subject?.trim() || null, question.source_file?.trim() || null, JSON.stringify(data))
        : env.DB.prepare(
            "INSERT INTO questions (id, subject, chapter, difficulty, source, source_no, data) VALUES (?, ?, ?, ?, ?, ?, ?)",
          ).bind(id, question.subject?.trim() || "General", question.chapter?.trim() || null, question.difficulty?.trim() || "Moderate", question.source?.trim() || null, Number(question.sourceNo) || null, JSON.stringify(data)),
    );
    await env.DB.batch(batch);
  }

  return json({ ok: true, type, inserted: records.length, firstId, lastId: firstId + records.length - 1 });
}
