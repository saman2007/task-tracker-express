# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-08-06

### Added
- Integrated **Sequelize ORM** (`v6`) and **`mysql2`** database driver.
- Added MySQL database configuration (`src/utils/db.ts`) with environment variable support.
- Added `.env.example` for an example of the available ENVs.
- Added database seeding capability in `src/data/seed.sql` and added support to see database by running `npm run db:seed`.
- Added more Info to `README.md`.


### Changed
- Refactored `Task` model (`src/models/task.ts`) to extend Sequelize `Model`.
- Replaced filesystem local JSON file storage with MySQL relational database tables.
- Updated `Task` methods to execute async database queries.
- Moved environment variable logic to a separate module(`src/utils/envs.ts`).

### Removed
- Removed local JSON file reading/writing logic and dependency on `src/data/tasks.json`.


## [1.0.0] - 2026-08-01

### Added
- **Serving Pages (SSR):** 
  - Integrated `pug` template engine with custom layouts (`src/views/layouts/`) and reusable mixins (`src/views/mixins/`).
  - Added modular stylesheets (`src/public/css`) and client-side scripting for interactive UI elements (`src/public/js/delete-modal.js`).

- **Routes & Views:**
  - `GET /`: Dashboard page displaying total, pending, and completed task counts, along with the 3 most recently added tasks.
  - `GET /tasks`: Displays all tasks. Accepts a `priority` query parameter (`0`–`3`) to filter tasks.
  - `GET /tasks/add`: Form page to create a new task.
  - `POST /tasks/add`: Route to process and save new task details.
  - `GET /tasks/:id`: Task detail view.
  - `GET /tasks/:id/edit`: Form page to edit an existing task.
  - `POST /tasks/:id/edit`: Route to process and save task updates.
  - `POST /tasks/:id/delete`: Route to remove a task by ID.
  - `POST /tasks/:id/toggle`: Route to toggle a task's status between completed and pending.
  - `GET /404`: Dedicated 404 Not Found error page.

- **Data & Models:** 
  - Created `Task` class model (`src/models/task.ts`) encapsulating full CRUD operations.
  - Initialized local JSON file storage (`src/data/tasks.json`) as a lightweight persistence layer for now.

- **Architecture & Infrastructure:**
  - Implemented MVC(`src/controllers`, `src/views`, `src/models`) and OOP(`Task` class) patterns.
  - Added TypeScript custom interfaces, type definitions, and application utilities.

- **Documentation:** 
  - Created project `README.md` covering setup, architecture, and future roadmap.