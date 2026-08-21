-- Seed SQL Script for Task Tracker Application
-- Table: users
-- Test Password for seeded users: Password123 (bcrypt hash: $2b$10$gq3Q9qlDOfB.TkuPReybIu55KNydMG5cdH2Wk3jQtzi0xaJ02vULm)

INSERT INTO `users` (`id`, `fullname`, `email`, `password`, `createdAt`, `updatedAt`) VALUES
(
  1,
  'Alex Morgan',
  'alex.morgan@example.com',
  '$2b$10$gq3Q9qlDOfB.TkuPReybIu55KNydMG5cdH2Wk3jQtzi0xaJ02vULm',
  '2026-08-01 09:00:00',
  CURRENT_TIMESTAMP
),
(
  2,
  'Sarah Connor',
  'sarah.connor@example.com',
  '$2b$10$gq3Q9qlDOfB.TkuPReybIu55KNydMG5cdH2Wk3jQtzi0xaJ02vULm',
  '2026-08-01 09:30:00',
  CURRENT_TIMESTAMP
);

-- Table: tasks
-- Priority ENUM values: 'LOW', 'MEDIUM', 'HIGH'
-- 7 Tasks for User 1 (Alex Morgan) & 5 Tasks for User 2 (Sarah Connor)

INSERT INTO `tasks` (`title`, `note`, `priority`, `isCompleted`, `userId`, `createdAt`, `updatedAt`) VALUES
-- Tasks for User 1 (7 tasks)
(
  'Refactor Database Schema & Sequelize Models',
  'Update the relational database models to support user-task mapping and add foreign key constraints for cascading deletes.',
  'HIGH',
  0,
  1,
  '2026-08-10 09:15:00',
  CURRENT_TIMESTAMP
),
(
  'Prepare Computer Networks Assignment 3',
  'Review RFC standards for TCP congestion control algorithms and complete problem set 4 regarding subnetting calculations.',
  'HIGH',
  1,
  1,
  '2026-08-11 14:30:00',
  CURRENT_TIMESTAMP
),
(
  'Design Delete Confirmation Modal in Pug',
  'Create a reusable mixin component for delete confirmation modal and style action buttons using modern CSS backdrop filters.',
  'MEDIUM',
  1,
  1,
  '2026-08-12 11:00:00',
  CURRENT_TIMESTAMP
),
(
  'Setup Express Session Authentication Middleware',
  'Implement session verification inside route middleware to handle protected dashboard routes effectively.',
  'MEDIUM',
  0,
  1,
  '2026-08-13 08:20:00',
  CURRENT_TIMESTAMP
),
(
  'Review Wireless Headset Market Deals',
  'Compare latency, battery life, and microphone quality between Cloud Flight and Cloud 3 Wireless models for over-ear setups.',
  'LOW',
  1,
  1,
  '2026-08-14 16:45:00',
  CURRENT_TIMESTAMP
),
(
  'Optimize SQL Query Indexes for Tasks Table',
  'Analyze EXPLAIN query plans for filtering tasks by priority and userId to add compound indexes.',
  'HIGH',
  0,
  1,
  '2026-08-15 10:10:00',
  CURRENT_TIMESTAMP
),
(
  'Write Unit Tests for Auth Validation Schemas',
  'Add unit tests verifying Zod schema validation rules for email and password constraints during sign up and sign in.',
  'LOW',
  0,
  1,
  '2026-08-16 13:00:00',
  CURRENT_TIMESTAMP
),

-- Tasks for User 2 (5 tasks)
(
  'Configure CI/CD Pipeline with GitHub Actions',
  'Setup continuous integration workflow to run TypeScript compiler checks, linting, and automated tests on every pull request.',
  'HIGH',
  0,
  2,
  '2026-08-12 10:00:00',
  CURRENT_TIMESTAMP
),
(
  'Implement User Profile Settings Page',
  'Build UI and backend endpoint allowing users to update full name and change password securely.',
  'MEDIUM',
  0,
  2,
  '2026-08-13 15:30:00',
  CURRENT_TIMESTAMP
),
(
  'Audit Web Application Security Headers',
  'Integrate Helmet middleware to set proper Content-Security-Policy, HSTS, and X-Frame-Options HTTP response headers.',
  'HIGH',
  1,
  2,
  '2026-08-14 11:20:00',
  CURRENT_TIMESTAMP
),
(
  'Update README and API Documentation',
  'Document project setup steps, environment variable configuration, and seed database execution commands.',
  'LOW',
  1,
  2,
  '2026-08-15 17:00:00',
  CURRENT_TIMESTAMP
),
(
  'Implement Task Sorting and Search Functionality',
  'Add client-side and server-side search by task title and notes with debounce input handling.',
  'MEDIUM',
  0,
  2,
  '2026-08-16 14:15:00',
  CURRENT_TIMESTAMP
);
