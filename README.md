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

2. **Install dependencies:** `npm install`
    * You can use any other package managers, such as `pnpm`, `yarn` or etc. 

3. **Initialize local data:**
   In case that you want to see some example tasks, Copy content of the provided example JSON file in `src/data/tasks.example.json` and paste it to `src/data/tasks.json`(you may need to create the file first)  
   To easily create your initial local data store, simply run this command in the root of the project:
   `cp src/data/tasks.example.json src/data/tasks.json`

4. **Configure port(optional):** The server will be listened to port `3000` by default. But if you want to change it, create a `.env` file in the root of the project and set set the port you want, like this: `PORT=YOUR_PORT` 

5. **Run in Development mode:** `npm run dev`

Open your browser and visit `http://localhost:port` to interact with the application(port is by default `3000`).

---

# Purpose
The purpose of developing this project is to practice what I have learned during learning node js backend development. As I learn more, I keep adding more feature to the project. The focus of this project is on backend side, not the frontend side. But I have a look at frontend side too, to make it good looking.

---

## 🗺️ Roadmap & Future Enhancements

As I learn new tools and practices, this project will continue to evolve:

- [ ] **Persistent Database:** Migrate local JSON file storage to a relational database (e.g., PostgreSQL with Drizzle ORM).
- [ ] **Authentication:** Implement user registration, login, and session management.
- [ ] **REST API Endpoints:** Expose JSON API endpoints alongside server-rendered views.
- [ ] **Filter & Search:** Add search capability by title/description and filter by task priority.
- [ ] **Testing:** Add unit tests for controllers and models using Jest or Supertest.

---

## 📄 License

This project is open-source and available under the MIT License.