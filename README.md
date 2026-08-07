# Task Tracker Express 📝

A server-side rendered Task Management application built with **Node.js**, **Express**, **TypeScript**, and **Pug**. 

This repository serves as a hands-on project designed to practice and consolidate core backend development concepts, MVC architecture, server-side rendering, and TypeScript integration.

---

## 🚀 Features

- **Dashboard View:** See your three recently added tasks and a statistic of how many tasks you created, completed an not complete.
- **Task Management:**
  - Create new tasks with title, description, and priority level.
  - View detailed task pages.
  - Create, read, update and delete(CRUD) feature for managing tasks.
  - Mark a task as done or UnDone.

---

## 🛠️ Tech Stack

- **Runtime Environment:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Template Engine:** Pug
- **Styling & Client Scripting:** CSS & Vanilla JavaScript
- **Package Manager:** `pnpm`
- **Architecture**: MVC, OOP

---

## 📁 Project Structure

task-tracker-express/  
├── src/  
│   ├── controllers/      # Request handlers (dashboard, tasks, notFound)  
│   ├── data/             # Local data storage and example task data  
│   ├── models/           # Domain models and data access abstraction  
│   ├── public/           # Static assets  
│   │   ├── css/          # Modular CSS files for each view  
│   │   └── js/           # Client-side scripts  
│   ├── routes/           # Express router definitions  
│   ├── types/            # Custom TypeScript types, interfaces, and globals  
│   ├── utils/            # Helper functions and constants  
│   ├── views/            # Pug templates, layouts, and mixins  
│   └── app.ts            # Application entry point  
├── package.json  
└── tsconfig.json  

---

## ⚡ Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- Node.js - This project is developed with Node.js v22.20.0. since I didn't test this project with other Node.js versions, I suggest you to run the project with this version.

### Installation & Setup

1. **Clone the repository:**
   ```git
   git clone https://github.com/saman2007/task-tracker-express 
   ```

2. **Install dependencies:** Run `npm install` or `pnpm install` or `yarn install` Or command of any other package manager that you are using.

2. **Database initialization:**
   You must create a `mysql` database for this project.

3. **Setting ENVs:**
   You need to provide the credentials of the database you created and other settings for the project. For this, create a `.env` in the root of the project. Then take a look at `.env.example` to see the required and optional ENVs with their description. Provide those ENVs in `.env`.

4. **Configure port(optional):** The server will be listened to port `3000` by default. But if you want to change it, set the port you want like this: `PORT = YOUR_PORT` in `.env` file that you created in step 3.

5. **Seeding data to database(optional):** There are some example data for tables in `src/data/*.sql` in case that you want to run the project and don't want to see the project empty. If you want to insert those data to your tables, you can manually run the `sql` files in your database or run `npm run db:seed` which will automatically insert all the example data to your database that you provided its credentials in `.env` file.  

6. **Run in Development mode:** `npm run dev`

Open your browser and visit `http://localhost:port` to interact with the application(port is by default `3000`).

---

# Purpose
The purpose of developing this project is to practice what I have learned during learning node js backend development. As I learn more, I keep adding more feature to the project. The focus of this project is on backend side, not the frontend side. But I have a look at frontend side too, to make it good looking.

---

## 🗺️ Roadmap & Future Enhancements

As I learn new tools and practices, this project will continue to evolve:

- [x] **Persistent Database:** Migrate local JSON file storage to a relational database (e.g., PostgreSQL with Drizzle ORM).
- [ ] **Authentication:** Implement user registration, login, and session management.
- [ ] **REST API Endpoints:** Expose JSON API endpoints alongside server-rendered views.
- [ ] **Filter & Search:** Add search capability by title/description and filter by task priority.
- [ ] **Testing:** Add unit tests for controllers and models using Jest or Supertest.

---

## 📄 License

This project is open-source and available under the MIT License.