# DevFlow — Team Task Management Platform

DevFlow is a full-stack task management application that helps users create, track, update, and delete tasks through a web dashboard.

## Features

- Create tasks with a title, description, status, and priority.
- View all tasks and retrieve individual tasks by ID.
- Update task details and track progress.
- Delete tasks from the dashboard.
- Persist task data using an H2 database.
- Use a React dashboard connected to a Spring Boot REST API.

## Tech Stack

**Frontend:** React, Vite, JavaScript, CSS  
**Backend:** Java 17, Spring Boot, REST APIs  
**Database:** H2, Spring Data JPA  
**Tools:** Maven, Git, GitHub, VS Code

## Project Structure

```text
devflow-team-management/
├── frontend/                 # React frontend
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       └── main.jsx
├── src/
│   ├── main/
│   │   ├── java/com/devflow_backend/
│   │   │   ├── controller/
│   │   │   ├── model/
│   │   │   └── repository/
│   │   └── resources/
│   │       └── application.properties
│   └── test/
├── pom.xml
├── mvnw
├── mvnw.cmd
└── README.md
```

## Getting Started

### Prerequisites

- Java 17
- Node.js and npm

### 1. Start the Backend

From the project root, run:

```powershell
.\mvnw.cmd spring-boot:run
```

The backend API runs at:

`http://localhost:8080`

### 2. Start the Frontend

Open a second terminal and run:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Open the local URL shown by Vite, usually:

`http://localhost:5173`

Keep both development servers running while using the application.

## REST API Endpoints

Base URL: `http://localhost:8080/api/tasks`

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/tasks` | Get all tasks |
| GET | `/api/tasks/{id}` | Get a task by ID |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/{id}` | Update a task |
| DELETE | `/api/tasks/{id}` | Delete a task |

### Example Task

```json
{
  "title": "Build DevFlow dashboard",
  "description": "Create the task management interface",
  "status": "TODO",
  "priority": "HIGH"
}
```

Supported statuses: `TODO`, `IN_PROGRESS`, `DONE`  
Supported priorities: `LOW`, `MEDIUM`, `HIGH`

## Database

DevFlow uses H2 with Spring Data JPA. The database is configured to store data locally, allowing task records to persist across backend restarts.

Local database files are excluded from Git using `.gitignore`.

## Future Improvements

- User authentication and role-based permissions
- Team workspaces and task assignment
- Comments and issue tracking
- Search, sorting, and pagination
- Automated backend and frontend tests
- Deployment to a cloud platform

## Author

Developed as a full-stack software engineering project to practise REST API development, database integration, and frontend-backend communication.
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
