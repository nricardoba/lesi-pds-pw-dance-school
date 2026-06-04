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
[use this cheat-sheet to get this task done](docs/database/database.md)

5. Start the development server:
```bash
npm run dev
```
This will start the server using `nodemon`, which automatically restarts the server when file changes are detected.
