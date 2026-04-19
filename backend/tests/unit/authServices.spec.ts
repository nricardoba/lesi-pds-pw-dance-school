import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as authServices from '../../src/services/authServices';
import { prisma } from '../../src/config/db';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

// -----------------------
// Mocks Globais
// -----------------------
vi.mock('../../src/config/db', () => ({
  prisma: {
    userCredential: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}));

vi.mock('jsonwebtoken', () => ({
  sign: vi.fn(),
}));

describe('Auth Services - Unit Tests', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loginService', () => {
    // Dados reutilizáveis nos testes
    const validPayload = { email: 'teste@teste.com', password: 'password123' };
    
    const dbMockedUser = {
      userId: 1,
      userCredentialPasswordHash: 'hashed_password',
      user: { 
        userId: 1, 
        userName: 'Teste Silva',
        userTypeId: 2,
        userType: { userTypeDesc: 'STUDENT' } 
      },
    };

    // -----------------------
    // Cenários de Sucesso
    // -----------------------
    describe('Sucesso', () => {
      it('deve devolver o token e os dados do utilizador corretamente (caso feliz)', async () => {
        // Setup dos mocks
        vi.mocked(prisma.userCredential.findFirst).mockResolvedValue(dbMockedUser as any);
        vi.mocked(bcrypt.compare).mockResolvedValue(true as any);
        vi.mocked(jwt.sign).mockReturnValue('fake_jwt_token' as any);
        vi.mocked(prisma.userCredential.update).mockResolvedValue({} as any);

        // Execução
        const response = await authServices.loginService(validPayload);

        // Asserts
        expect(response).toMatchObject({
          accessToken: 'fake_jwt_token',
          user: {
            user_id: 1,
            user_name: 'Teste Silva',
            user_type_id: 2,
            user_type_desc: 'STUDENT',
          },
        });
        expect(prisma.userCredential.findFirst).toHaveBeenCalledTimes(1);
        expect(bcrypt.compare).toHaveBeenCalledWith(validPayload.password, dbMockedUser.userCredentialPasswordHash);
        expect(jwt.sign).toHaveBeenCalledTimes(1);
        expect(prisma.userCredential.update).toHaveBeenCalledTimes(1);
      });
    });

    // -----------------------
    // Cenários de Falha
    // -----------------------
    describe('Falhas de Validação e Regras de Negócio', () => {
      it('deve lançar um erro (400) se o email for inválido', async () => {
        const invalidPayload = { email: 'not-an-email', password: '123' }; 

        await expect(authServices.loginService(invalidPayload)).rejects.toMatchObject({
          statusCode: 400,
          message: 'Dados inválidos.',
        });

        // Garante que nem chega a tentar ir à DB
        expect(prisma.userCredential.findFirst).not.toHaveBeenCalled();
      });

      it('deve lançar um erro (401) se o email não existir na base de dados', async () => {
        vi.mocked(prisma.userCredential.findFirst).mockResolvedValue(null);

        await expect(authServices.loginService(validPayload)).rejects.toMatchObject({
          statusCode: 401,
          message: 'Credenciais inválidas.',
        });

        expect(prisma.userCredential.findFirst).toHaveBeenCalledTimes(1);
        expect(bcrypt.compare).not.toHaveBeenCalled(); 
      });

      it('deve lançar um erro (401) se a password estiver errada', async () => {
        const payloadWrongPwd = { email: 'teste@teste.com', password: 'wrongpassword' };

        vi.mocked(prisma.userCredential.findFirst).mockResolvedValue(dbMockedUser as any);
        vi.mocked(bcrypt.compare).mockResolvedValue(false as any); // Password dá match=false

        await expect(authServices.loginService(payloadWrongPwd)).rejects.toMatchObject({
          statusCode: 401,
          message: 'Credenciais inválidas.',
        });
        
        expect(prisma.userCredential.findFirst).toHaveBeenCalledTimes(1);
        expect(bcrypt.compare).toHaveBeenCalledWith(payloadWrongPwd.password, dbMockedUser.userCredentialPasswordHash);
        expect(prisma.userCredential.update).not.toHaveBeenCalled(); // Não pode registar último login
      });
    });
  });
});
