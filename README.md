# DevFlow — Team Task Management Platform

DevFlow is a full-stack task management application built with React, Spring Boot, and an H2 database. It allows users to create, view, update, and delete tasks through a web dashboard.

## Features

- Create tasks with a title, description, status, and priority.
- View all tasks and retrieve individual tasks by ID.
- Edit existing tasks and update their status.
- Delete tasks from the dashboard.
- Store tasks using Spring Data JPA and an H2 database.
- Connect a React frontend to a Spring Boot REST API.

## Technology Stack

- **Frontend:** React, Vite, JavaScript, CSS
- **Backend:** Java 17, Spring Boot, REST APIs
- **Database:** H2, Spring Data JPA
- **Build Tool:** Maven
- **Version Control:** Git and GitHub

## Project Structure

```text
devflow-team-management/
├── frontend/                 # React frontend
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       └── main.jsx
├── src/
│   └── main/
│       ├── java/com/devflow_backend/
│       │   ├── controller/
│       │   ├── model/
│       │   └── repository/
│       └── resources/
│           └── application.properties
├── pom.xml
└── README.md
```

## Getting Started

### Prerequisites

- Java 17
- Node.js and npm

### Start the Backend

From the project root, run:

```powershell
.\mvnw.cmd spring-boot:run
```

The backend API runs at `http://localhost:8080`.

### Start the Frontend

Open a second terminal and run:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Open the local URL shown by Vite, usually `http://localhost:5173`.

Keep both development servers running while using the application.

## REST API Endpoints

Base URL: `http://localhost:8080/api/tasks`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks` | Retrieve all tasks |
| GET | `/api/tasks/{id}` | Retrieve a task by ID |
| POST | `/api/tasks` | Create a new task |
| PUT | `/api/tasks/{id}` | Update a task |
| DELETE | `/api/tasks/{id}` | Delete a task |

## Database

DevFlow uses H2 with Spring Data JPA. The database is configured for local file-based storage so task data can persist across backend restarts.

## Future Improvements

- User authentication and authorization
- Team workspaces and task assignment
- Search, sorting, and pagination
- Automated tests
- Cloud deployment

## Author

Built as a full-stack software engineering project to practise frontend development, REST API development, database integration, and frontend-backend communication.
