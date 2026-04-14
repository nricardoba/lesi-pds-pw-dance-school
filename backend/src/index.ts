// src/index.ts
import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './config/db';
import routes from './routes';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3333;

// Middlewares
app.use(cors()); // Permite pedidos do teu frontend
app.use(express.json()); // Permite receber dados no formato JSON
app.use(express.urlencoded({ extended: true })); // Permite receber dados de formulários
app.use(routes);

app.use('/', routes);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});