export const SUPPORT_CONTENT = {
  product: {
    slug: "product",
    path: "/product",
    label: "Product",
    title: "Everything you need for a smarter preparation workflow.",
    intro: "TracePG combines focused practice, previous-year questions, detailed review, and progress tracking to help you prepare with clarity and consistency.",
    contactEmail: "",
    contactPhone: "",
    supportHours: "",
    supportCtaLabel: "Start preparing",
    supportCtaUrl: "/",
    sections: [
      ["Focused question practice", "Build custom tests by subject, chapter, and difficulty so every session matches what you need to work on today."],
      ["Previous-year questions", "Study real exam patterns with PYQ papers and use detailed review to understand every answer."],
      ["Progress that guides you", "Use history, analytics, wrong questions, notes, and smart revision to turn practice into a consistent plan."],
    ],
    faqs: [],
    updatedAt: null,
  },
  about: {
    slug: "about",
    path: "/about-us",
    label: "About Us",
    title: "Built to make postgraduate medical preparation more focused.",
    intro: "TracePG brings high-yield practice, revision, and progress tracking into one calm study workspace for medical students and doctors preparing for postgraduate entrance exams.",
    operatorName: "Yogesh Kumar Kashyap",
    contactEmail: "",
    contactPhone: "",
    supportHours: "",
    supportCtaLabel: "Explore TracePG",
    supportCtaUrl: "/",
    sections: [
      ["Our approach", "We believe consistent, deliberate practice beats last-minute cramming. TracePG helps you turn a large question bank into a repeatable daily workflow with focused tests, review, analytics, and revision reminders."],
      ["What you can do here", "Practise topic-wise questions, work through previous-year questions, review every answer, save notes, track weak areas, and return to the questions that need another look."],
      ["Made for your preparation journey", "Your study history and progress stay connected to your account so you can build momentum over time and make each practice session more useful than the last."],
    ],
    teamMembers: [
      {
        name: "Yogesh Kumar Kashyap",
        qualification: "Co Founder & Developer",
        image: "/trace-logo-square.png",
        summary: "Yogesh operates TracePG with a focus on building a dependable, student-first preparation workspace that makes practice, review, and progress easier to follow.",
      },
      {
        name: "Madhav Chandrakar",
        qualification: "MBBS, 3rd Yr Student · Founder",
        image: "/trace-logo-square.png",
        summary: "Madhav originated the core idea behind TracePG and helps shape the learning experience through thoughtful resource collection and a student’s perspective on postgraduate medical preparation.",
      },
    ],
    faqs: [],
    updatedAt: null,
  },
  contact: {
    slug: "contact",
    path: "/contact-us",
    label: "Contact Us",
    title: "We’re here to help you keep moving.",
    intro: "Have a question, found an issue, or want to share feedback? Reach out and the TracePG team will get back to you.",
    contactEmail: "support@tracepg.com",
    contactPhone: "",
    supportHours: "Monday to Friday, 9:00 AM to 6:00 PM IST",
    supportCtaLabel: "Email us",
    supportCtaUrl: "mailto:support@tracepg.com",
    sections: [
      ["Before you write", "For account or payment questions, include the email address used for your TracePG account and any relevant transaction details. Please do not send passwords or other sensitive credentials."],
      ["Feedback and suggestions", "Tell us what would make your preparation workflow better. Product feedback, content corrections, and ideas for future features are welcome."],
    ],
    faqs: [],
    updatedAt: null,
  },
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
  if (pathname === "/product" || pathname === "/products") return SUPPORT_CONTENT.product;
  if (pathname === "/about-us" || pathname === "/about") return SUPPORT_CONTENT.about;
  if (pathname === "/contact-us" || pathname === "/contact") return SUPPORT_CONTENT.contact;
  if (pathname === "/help-support") return SUPPORT_CONTENT.help;
  if (pathname === "/qa" || pathname === "/questions-answers") return SUPPORT_CONTENT.qa;
  return null;
}
