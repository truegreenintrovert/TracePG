export function getSubjects(questions) {
  return [...new Set(questions.map((question) => question.subject))].sort(
    (a, b) => a.localeCompare(b),
  );
}

export function getSubjectStats(questions, state) {
  return getSubjects(questions).map((subject) => {
    const subjectQuestions = questions.filter(
      (question) => question.subject === subject,
    );
    const attempted = subjectQuestions.filter(
      (question) => state.attempts[question.id],
    );
    const correct = attempted.filter(
      (question) => state.attempts[question.id].correct,
    ).length;
    return {
      subject,
      total: subjectQuestions.length,
      attempted: attempted.length,
      correct,
      accuracy: attempted.length
        ? Math.round((correct / attempted.length) * 100)
        : 0,
    };
  });
}

export function getDueQuestions(questions, state) {
  const now = Date.now();
  return questions.filter(
    (question) =>
      state.revision[question.id] && state.revision[question.id] <= now,
  );
}

export function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatSeconds(value = 0) {
  if (value < 60) return `${Math.round(value)}s`;
  return `${Math.floor(value / 60)}m ${Math.round(value % 60)}s`;
}

export function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}
