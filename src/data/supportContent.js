export const SUPPORT_CONTENT = {
  help: {
    slug: "help",
    label: "Help & Support",
    title: "How can we help?",
    intro: "Find answers, learn how TracePG works, or contact our support team when you need a hand.",
    contactEmail: "support@tracepg.com",
    contactPhone: "",
    supportHours: "Monday to Friday, 9:00 AM to 6:00 PM IST",
    supportCtaLabel: "Email support",
    supportCtaUrl: "mailto:support@tracepg.com",
    sections: [
      ["Getting started", "Choose a subject, select the topics you want to practise, and start a test. Your progress, history, wrong questions, and notes are saved to your account."] ,
      ["Account and login", "Use your email and password or Google sign-in. If you cannot access your account, use Forgot password on the sign-in screen or contact support."] ,
      ["Tests and results", "You can review answers after submitting a test. Your history includes scores, time spent, and the questions from each attempt."],
    ],
    faqs: [],
    updatedAt: null,
  },
  qa: {
    slug: "qa",
    label: "Q&A",
    title: "Questions & answers",
    intro: "Quick answers to common questions about TracePG and your preparation workflow.",
    contactEmail: "support@tracepg.com",
    contactPhone: "",
    supportHours: "",
    supportCtaLabel: "Ask support",
    supportCtaUrl: "mailto:support@tracepg.com",
    sections: [],
    faqs: [
      { category: "Using TracePG", question: "Can I use TracePG on my phone?", answer: "Yes. TracePG is responsive and can be used from a mobile browser. Add it to your home screen for quick access." },
      { category: "Tests", question: "Can I review a test after submitting it?", answer: "Yes. Open History, choose an attempt, and select Review answers." },
      { category: "Account", question: "How do I change my name?", answer: "Open your profile from the top-right avatar, edit your name, and save the changes." },
    ],
    updatedAt: null,
  },
};

export function getSupportPage(pathname) {
  if (pathname === "/help-support") return SUPPORT_CONTENT.help;
  if (pathname === "/qa" || pathname === "/questions-answers") return SUPPORT_CONTENT.qa;
  return null;
}
