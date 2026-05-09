import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  addUserContactService,
  deleteUserContactService,
} from '../../src/services/users/userContactsServices';
import { prisma } from '../../src/config/db';
import { AppError } from '../../src/utils/appError';
import { count } from 'console';

vi.mock('../../src/config/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    contact: {
      findFirst: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    userContact: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe('User Contacts Services - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addUserContactService', () => {
    it('deve adicionar um contacto com sucesso', async () => {
      const params = { id: 1 };
      const body = { contactValue: '+351912345678', contactTypeId: 1 };

      (prisma.user.findUnique as any).mockResolvedValue({ userId: 1 });
      (prisma.contact.findFirst as any).mockResolvedValue(null);
      (prisma.contact.create as any).mockResolvedValue({ contactId: 1 });
      (prisma.userContact.create as any).mockResolvedValue({ userId: 1, contactId: 1 });

      const result = await addUserContactService(params, body);

      expect(result).toBeDefined();
    });

    it('deve lançar erro se utilizador não existe', async () => {
      const params = { id: 99999 };
      const body = { contactValue: '+351912345678', contactTypeId: 1 };

      (prisma.user.findUnique as any).mockResolvedValue(null);

      await expect(addUserContactService(params, body)).rejects.toThrow();
    });
  });

it('deve remover um contacto com sucesso', async () => {
  const params = { id: 1, contactId: 1 };

  (prisma.userContact.findUnique as any).mockResolvedValue({
    userId: 1,
    contactId: 1,
  });

  (prisma.userContact.delete as any).mockResolvedValue({
    userId: 1,
    contactId: 1,
  });

  (prisma.userContact.count as any).mockResolvedValue(0);

  await deleteUserContactService(params);

  expect(prisma.userContact.delete).toHaveBeenCalled();
  expect(prisma.userContact.count).toHaveBeenCalled();
});
});
