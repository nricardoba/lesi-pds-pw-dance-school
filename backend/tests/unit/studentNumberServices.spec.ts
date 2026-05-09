import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  upsertStudentNumberService,
  deleteStudentNumberService,
} from '../../src/services/users/studentNumberServices';
import { prisma } from '../../src/config/db';
import { AppError } from '../../src/utils/appError';

vi.mock('../../src/config/db', () => ({
  prisma: {
    studentNumber: {
  findMany: vi.fn(),
  findUnique: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  upsert: vi.fn(),
},
    user: {
      findUnique: vi.fn(),
    },
    schoolYear: {
      findUnique: vi.fn(),
    },
  },
}));

describe('Student Number Services - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('upsertStudentNumberService', () => {
    it('deve criar ou atualizar um número de estudante com sucesso', async () => {
  const params = { id: 1 };
  const body = { studentNumber: '2020001' };

  const mockStudentNumber = {
    userId: 1,
    studentNumber: '2020001',
  };

  (prisma.user.findUnique as any).mockResolvedValue({ userId: 1 });
  (prisma.studentNumber.upsert as any).mockResolvedValue(mockStudentNumber);

  const result = await upsertStudentNumberService(params, body);

  expect(result).toEqual(mockStudentNumber);
  expect(prisma.user.findUnique).toHaveBeenCalledWith({
    where: { userId: 1 },
  });
  expect(prisma.studentNumber.upsert).toHaveBeenCalled();
});

    it('deve lançar erro se utilizador não existe', async () => {
      const body = { userId: 99999, studentNumber: '2020001', schoolYearId: 1 };

      (prisma.user.findUnique as any).mockResolvedValue(null);

      await expect(upsertStudentNumberService(body)).rejects.toThrow();
    });
  });

  it('deve terminar com sucesso mesmo se o número de estudante não existir', async () => {
  const params = { id: 99999 };

  (prisma.studentNumber.delete as any).mockResolvedValue({} as any);

  const result = await deleteStudentNumberService(params);

  expect(result).toMatchObject({
    message: 'Número de aluno apagado com sucesso.',
  });

  expect(prisma.studentNumber.delete).toHaveBeenCalledWith({
    where: { userId: 99999 },
  });
});
});
