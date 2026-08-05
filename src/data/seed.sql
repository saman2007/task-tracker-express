-- Seed SQL Script for Task Tracker Application
-- Table: tasks
-- Priority ENUM values: 'LOW', 'MEDIUM', 'HIGH'

INSERT INTO `tasks` (`title`, `note`, `priority`, `isCompleted`, `createdAt`, `updatedAt`) VALUES
(
  'Refactor Database Schema & Drizzle ORM Models',
  'Update the relational database models to support user-task mapping and add foreign key constraints for cascading deletes.',
  'HIGH',
  0,
  '2026-07-28 09:15:00',
  CURRENT_TIMESTAMP
),
(
  'Prepare Computer Networks Assignment 3',
  'Review RFC standards for TCP congestion control algorithms and complete problem set 4 regarding subnetting calculations.',
  'HIGH',
  0,
  '2026-07-29 14:30:00',
  CURRENT_TIMESTAMP
),
(
  'Design Delete Confirmation Modal in Pug',
  'Create a reusable mixin component for delete confirmation modal and style action buttons using modern CSS backdrop filters.',
  'MEDIUM',
  1,
  '2026-07-30 11:00:00',
  CURRENT_TIMESTAMP
),
(
  'Setup Next.js 15 Middleware for Auth Protection',
  'Implement JWT session verification inside edge middleware to handle protected dashboard routes effectively.',
  'MEDIUM',
  0,
  '2026-07-31 08:20:00',
  CURRENT_TIMESTAMP
),
(
  'Review Wireless Headset Market Deals',
  'Compare latency, battery life, and microphone quality between Cloud Flight and Cloud 3 Wireless models for over-ear setups.',
  'LOW',
  1,
  '2026-07-31 16:45:00',
  CURRENT_TIMESTAMP
);
