// src/index.ts
import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './config/db';
import routes from './routes';
import { globalErrorHandler } from './middlewares/globalErrorHandler';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3333;

// Middlewares
app.use(cors()); // Permite pedidos do teu frontend
app.use(express.json()); // Permite receber dados no formato JSON
app.use(express.urlencoded({ extended: true })); // Permite receber dados de formulários
app.use('/uploads', express.static('uploads')); // Serve ficheiros estáticos da pasta "uploads"

app.use((_req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = ((body: unknown) => {
    if (
      body &&
      typeof body === 'object' &&
      'error' in body &&
      typeof (body as { error?: unknown }).error === 'string'
    ) {
      const normalized = {
        ...(body as Record<string, unknown>),
        error: {
          message: (body as { error: string }).error,
        },
      };
      return originalJson(normalized);
    }

    return originalJson(body);
  }) as typeof res.json;

  next();
});

app.use('/', routes);

// Middleware Global de Erros (sempre no final)
app.use(globalErrorHandler);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`); 
});