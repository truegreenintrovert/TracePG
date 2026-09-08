-- Identify the operator on the public About Us page for payment-provider review.
UPDATE support_pages
SET sections = '[["Our approach","We believe consistent, deliberate practice beats last-minute cramming. TracePG helps you turn a large question bank into a repeatable daily workflow with focused tests, review, analytics, and revision reminders."],["What you can do here","Practise topic-wise questions, work through previous-year questions, review every answer, save notes, track weak areas, and return to the questions that need another look."],["Made for your preparation journey","Your study history and progress stay connected to your account so you can build momentum over time and make each practice session more useful than the last."]]'
WHERE slug = 'about';
