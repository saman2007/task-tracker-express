# Task Tracker Express 📝

A server-side rendered Task Management application built with **Node.js**, **Express**, **TypeScript**, **Pug**, **Sequelize**, and **MySQL**. 

This repository serves as a hands-on project designed to practice and consolidate core backend development concepts, MVC architecture, authentication & session management, database relations, server-side rendering, and TypeScript integration.

---

## 🚀 Features

- **User Authentication & Session Management:**
  - Secure user registration and sign-in with password hashing.
  - Persistent sessions stored in MySQL
  - "Remember Me" persistent cookie option.
- **Multi-User Task Management:**
  - Full isolation: each user manages and views only their own tasks.
  - Create tasks with title, description/notes, and priority level (`LOW`, `MEDIUM`, `HIGH`).
  - View detailed task pages.
  - Full CRUD operations (Create, Read, Update, Delete) and toggle completion status.
  - Filter tasks by priority.
- **Landing Page & Dashboard:**
  - Responsive landing page (`/`) highlighting app features.
  - User dashboard (`/dashboard`) showcasing task statistics (total, pending, completed) and the 3 newest tasks.

---

## 🛠️ Tech Stack

- **Runtime Environment:** Node.js (v22.x recommended)
- **Framework:** Express.js
- **Language:** TypeScript
- **Database & ORM:** MySQL & Sequelize ORM
- **Session Management:** `express-session` & `connect-session-sequelize`
- **Validation:** `zod`
- **Flash Messages:** `async-connect-flash`
- **Template Engine:** Pug
- **Styling & Client Scripting:** CSS & Vanilla JavaScript
- **Package Manager:** `pnpm`
- **Architecture**: MVC, OOP

---

## 📁 Project Structure

```text
task-tracker-express/  
├── src/  
│   ├── controllers/      # Route request handlers
│   ├── data/             # Database seed queries  
│   ├── middlewares/      # Express middlewares 
│   ├── models/           # Sequelize models & associations
│   ├── public/           # Static assets  
│   │   ├── css/          # Modular CSS stylesheets  
│   │   └── js/           # Client-side scripts  
│   ├── routes/           # Express router definitions  
│   ├── scripts/          # Global scripts fro different purposes
│   ├── types/            # TypeScript type declarations, interfaces, and globals  
│   ├── utils/            # Helper functions, constants, and Zod validation schemas  
│   ├── views/            # Pug templates, layouts, and mixins  
│   └── app.ts            # Application entry point  
├── package.json  
├── tsconfig.json  
└── CHANGELOG.md  
```

---

## ⚡ Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- Node.js - This project is developed with Node.js v22.20.0. since I didn't test this project with other Node.js versions, I suggest you to run the project with this version.
- MySQL Server

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/saman2007/task-tracker-express.git
   cd task-tracker-express
   ```

2. **Install dependencies:** Run `npm install` or `pnpm install` or `yarn install` or command of any other package manager that you are using.

2. **Database initialization:**
   You must create a `mysql` database for this project.

3. **Setting ENVs:**
   You need to provide the credentials of the database you created and other settings for the project. For this, create a `.env` in the root of the project. Then take a look at `.env.example` to see the required and optional ENVs with their description. Provide all the required ENVs in `.env`.

4. **Configure port(optional):** The server will be listened to port `3000` by default. But if you want to change it, set the port you want like this: `PORT = YOUR_PORT` in `.env` file that you created in step 3.

5. **Seeding data to database(optional):** There are some example data for tables in `src/data/*.sql` in case that you want to run the project and don't want to see the project empty. If you want to insert those data to your tables, you can manually run each query from top to bottom from `sql` file in your database. Or run `npm run db:seed` which will automatically add all the example data to your database tables that you provided its credentials in `.env` file.  
- **NOTE:** When you run the seed script, your database will be synced with the models, with `force: true` using `sequelize`. This option will first drop created tables for models and will replace all your data with the seed data. So run the command with caution.

6. **Run in Development mode:** `npm run dev`

Open your browser and visit `http://localhost:port` to interact with the application(port is by default `3000`).

---

# Purpose
The purpose of developing this project is to practice what I have learned during learning node js backend development. As I learn more, I keep adding more feature to the project. The focus of this project is on backend side, not the frontend side. But I have a look at frontend side too, to make it good looking.

---

## 🗺️ Roadmap & Future Enhancements

- [x] **Persistent Database:** Migrate local JSON file storage to a relational MySQL database with Sequelize ORM.
- [x] **Authentication:** Implement user registration, login, session management.
- [ ] **REST API Endpoints:** Expose JSON API endpoints alongside server-rendered views.
- [ ] **Filter & Search:** Add search capability by title/description and filter by task priority.
- [ ] **Testing:** Add unit and integration tests using Jest / Supertest.

---

## 📄 License

This project is open-source and available under the MIT License.