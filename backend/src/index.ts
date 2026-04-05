import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './config/db';

// Carregar variáveis de ambiente do ficheiro .env
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3333;

// Middlewares
app.use(cors()); // Permite pedidos do teu frontend
app.use(express.json()); // Permite receber dados no formato JSON
app.use(express.urlencoded({ extended: true })); // Permite receber dados de formulários

// Rota de teste básica
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Bem-vindo à API da Plataforma Ent\'Artes! 🕺' });
});

// Exemplo de rota de health check (para verificar se a BD está ligada)
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Tenta fazer uma query simples à BD para testar a ligação
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
