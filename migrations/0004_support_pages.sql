CREATE TABLE IF NOT EXISTS support_pages (
  slug TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  title TEXT NOT NULL,
  intro TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  support_hours TEXT,
  support_cta_label TEXT,
  support_cta_url TEXT,
  sections TEXT NOT NULL,
  faqs TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

INSERT OR IGNORE INTO support_pages (slug, label, title, intro, contact_email, contact_phone, support_hours, support_cta_label, support_cta_url, sections, faqs, updated_at)
VALUES ('help', 'Help & Support', 'How can we help?', 'Find answers, learn how TracePG works, or contact our support team when you need a hand.', 'support@tracepg.com', '', 'Monday to Friday, 9:00 AM to 6:00 PM IST', 'Email support', 'mailto:support@tracepg.com', '[["Getting started","Choose a subject, select the topics you want to practise, and start a test. Your progress, history, wrong questions, and notes are saved to your account."],["Account and login","Use your email and password or Google sign-in. If you cannot access your account, use Forgot password on the sign-in screen or contact support."],["Tests and results","You can review answers after submitting a test. Your history includes scores, time spent, and the questions from each attempt."]]', '[]', 0);

INSERT OR IGNORE INTO support_pages (slug, label, title, intro, contact_email, contact_phone, support_hours, support_cta_label, support_cta_url, sections, faqs, updated_at)
VALUES ('qa', 'Q&A', 'Questions & answers', 'Quick answers to common questions about TracePG and your preparation workflow.', 'support@tracepg.com', '', '', 'Ask support', 'mailto:support@tracepg.com', '[]', ' [{"category":"Using TracePG","question":"Can I use TracePG on my phone?","answer":"Yes. TracePG is responsive and can be used from a mobile browser. Add it to your home screen for quick access."},{"category":"Tests","question":"Can I review a test after submitting it?","answer":"Yes. Open History, choose an attempt, and select Review answers."},{"category":"Account","question":"How do I change my name?","answer":"Open your profile from the top-right avatar, edit your name, and save the changes."}]', 0);
