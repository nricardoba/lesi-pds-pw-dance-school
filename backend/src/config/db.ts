import { PrismaClient } from '@prisma/client';

// Instância única do Prisma Client para toda a aplicação
// Mantém apenas uma ligação à base de dados para evitar sobrecarga
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});
