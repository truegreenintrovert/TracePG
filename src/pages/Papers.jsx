import { useMemo, useState } from "react";
import { FiTarget } from "react-icons/fi";
import { shuffle } from "../lib/study";

const PYQ_PAPER_SIZE = 100;

export default function Papers({ papers, onStart }) {
  const years = [...new Set(papers.map((item) => item.year))].sort(
    (a, b) => Number(a) - Number(b),
  );
  const [year, setYear] = useState(years.at(-1) || "");
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () =>
      papers
        .filter(
          (item) =>
            item.year === year &&
            (!search || item.q.toLowerCase().includes(search.toLowerCase())),
        )
        .slice(0, 100),
    [papers, year, search],
  );
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.2em] text-brand-600">
          Year-wise practice
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          NEET-PG PYQ Papers
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Solve previous-year questions with the same focused runner.
        </p>
      </div>
      <section className="surface-card">
        <div className="flex flex-wrap gap-2">
          {years.map((item) => (
            <button
              className={`rounded-xl px-4 py-2 text-sm font-bold ${year === item ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}
              key={item}
              onClick={() => setYear(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <input
            className="field max-w-xl flex-1"
            placeholder={`Search ${year} questions`}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button
            className="primary-button"
            onClick={() =>
              onStart(
                shuffle(filtered)
                  .slice(0, PYQ_PAPER_SIZE)
                  .map((item, index) => ({
                    ...item,
                    id: `pyq-${year}-${index}`,
                    subject: `NEET-PG ${year}`,
                    difficulty: "Medium",
                    a: Number(item.a),
                  })),
                "NEET-PG " + year,
                PYQ_PAPER_SIZE,
              )
            }
          >
            <><FiTarget aria-hidden="true" /> Solve paper</>
          </button>
        </div>
      </section>
      <div className="space-y-3">
        {filtered.map((item) => (
          <article className="surface-card" key={`${item.year}-${item.no}`}>
            <div className="flex flex-wrap gap-2">
              <span className="tag tag-blue">NEET-PG {item.year}</span>
              <span className="tag">Q{item.no}</span>
            </div>
            <h2 className="mt-3 font-bold leading-6">{item.q}</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {item.o.map((option, index) => (
                <div className="text-sm text-slate-500" key={option}>
                  <b>{String.fromCharCode(65 + index)}.</b> {option}
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
