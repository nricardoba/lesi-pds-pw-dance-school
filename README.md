# Project 50+10 - Dance School

This project contains the frontend and backend applications for a dance school management platform.

---

## Frontend

The frontend is built using **React** with **Vite** and styled using **Tailwind CSS**. 

### Getting Started

To start working on the frontend, follow these steps to install all the dependencies:

1. Navigate to the frontend folder:
```bash
cd frontend
```

2. Install the required dependencies:
```bash
npm install
```
*Note: You must have Node.js and npm installed on your machine.*

3. Start the development server:
```bash
npm run dev
```

### Scripts

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the app for production.
- `npm run lint`: Runs ESLint to check for code issues.
- `npm run preview`: Locally previews the production build.

---

## Backend

The backend is built with **Node.js**, **Express**, and **TypeScript**, using **Prisma** as the ORM to connect to a **PostgreSQL** database.

### Getting Started

To start working on the backend, follow these steps:

1. Navigate to the backend folder:
```bash
cd backend
```

2. Install the required dependencies:
```bash
npm install
```

3. Environment Variables:
Create a `.env` file in the `backend` directory based on the environment variables required (e.g., `DATABASE_URL` for Prisma).

4. Setup the Database:
Generate the Prisma Client and run the migrations to create the database schema:
```bash
npm run prisma:generate
npm run prisma:migrate
```

5. Start the development server:
```bash
npm run dev
```
This will start the server using `nodemon`, which automatically restarts the server when file changes are detected.

### Scripts

- `npm run dev`: Starts the development server with auto-reloading (`nodemon src/index.ts`).
- `npm run start`: Runs the compiled production code (`node dist/index.js`).
- `npm run build`: Compiles TypeScript files to JavaScript (`tsc`).
- `npm run prisma:generate`: Generates the Prisma Client.
- `npm run prisma:migrate`: Applies migrations and updates the database schema (`prisma migrate dev`).

### Prisma Database Schema (Temp)

The application uses PostgreSQL with the following core entities:
- **User**: Represents Students, Teachers, and Admins.
- **Class**: Represents dance classes (e.g., "Ballet Clássico"), assigned to a Teacher.
- **Schedule**: Defines the days and times when classes happen.
- **Enrollment**: Manages the enrollment of Students in Classes.
