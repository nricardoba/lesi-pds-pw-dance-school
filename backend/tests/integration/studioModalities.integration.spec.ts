import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/index';
import { prisma } from '../../src/config/db';

describe('Testes de Integração - Studio Modalities', () => {
  const adminLogin = {
    email: process.env.ADMIN_EMAIL ?? 'admin@admin.com',
    password: process.env.ADMIN_PASSWORD ?? 'Admin123!',
  };

  let accessToken = '';
  let studioId: number | null = null;
  let modalityId: number | null = null;
  let studioModalityId: number | null = null;
  const uniqueSuffix = Date.now();

  beforeAll(async () => {
    // Login para obter token
    const loginRes = await request(app)
      .post('/auth/login')
      .send(adminLogin);

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty('accessToken');
    accessToken = loginRes.body.accessToken;

    // Criar um estúdio de teste
    const studio = await prisma.studio.create({
      data: {
        studioName: `Estúdio Teste SM ${uniqueSuffix}`,
        studioMaxCapacity: 20,
      },
    });
    studioId = studio.studioId;

    // Criar uma modalidade de teste
    const modality = await prisma.modality.create({
      data: {
        modalityName: `Modalidade Teste SM ${uniqueSuffix}`,
        modalityHourlyFee: 25,
      },
    });
    modalityId = modality.modalityId;
  });

  afterAll(async () => {
    try {
      // Try to delete studio modality if still exists
      if (studioModalityId) {
        try {
          await prisma.studioModality.delete({
            where: { studioModalityId },
          });
        } catch (e) {
          // Already deleted by test
        }
      }
      // Delete studio
      if (studioId) {
        try {
          await prisma.studioModality.deleteMany({
            where: { studioId },
          });
          await prisma.studio.delete({
            where: { studioId },
          });
        } catch (e) {
          // Already deleted by test
        }
      }
      // Delete modality
      if (modalityId) {
        try {
          await prisma.studioModality.deleteMany({
            where: { modalityId },
          });
          await prisma.modality.delete({
            where: { modalityId },
          });
        } catch (e) {
          // Already deleted or has dependencies
        }
      }
    } finally {
      await prisma.$disconnect();
    }
  });

  describe('CRUD de Studio Modalities', () => {
    it('1. deve listar todas as relações estúdio-modalidade', async () => {
      const response = await request(app)
        .get('/studio-modalities')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('2. deve criar uma relação estúdio-modalidade com sucesso', async () => {
      const newStudioModality = {
        studioId,
        modalityId,
      };

      const response = await request(app)
        .post('/studio-modalities')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newStudioModality);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('studioModalityId');
      expect(response.body).toHaveProperty('studioId', studioId);
      expect(response.body).toHaveProperty('modalityId', modalityId);

      studioModalityId = response.body.studioModalityId;
    });

    it('3. deve atualizar uma relação estúdio-modalidade com sucesso', async () => {
      // Criar uma segunda modalidade para atualizar para
      const secondModality = await prisma.modality.create({
        data: {
          modalityName: `Modalidade Segunda ${uniqueSuffix}`,
          modalityHourlyFee: 30,
        },
      });

      const updateData = {
        modalityId: secondModality.modalityId,
      };

      const response = await request(app)
        .put(`/studio-modalities/${studioModalityId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('modalityId', secondModality.modalityId);

      // Limpar
      await prisma.modality.delete({
        where: { modalityId: secondModality.modalityId },
      });
    });

    it('4. deve retornar 404 ao atualizar relação inexistente', async () => {
      const updateData = { modalityId };

      const response = await request(app)
        .put('/studio-modalities/999999')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('5. deve retornar 404 ao apagar relação inexistente', async () => {
      const response = await request(app)
        .delete('/studio-modalities/999999')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Validações e Autenticação', () => {
    it('deve impedir criação sem autenticação', async () => {
      const newStudioModality = {
        studioId,
        modalityId,
      };

      const response = await request(app)
        .post('/studio-modalities')
        .send(newStudioModality);

      expect(response.status).toBe(401);
    });

    it('deve impedir criação com dados inválidos', async () => {
      const invalidData = {
        studioId: 'invalido',
        modalityId: '',
      };

      const response = await request(app)
        .post('/studio-modalities')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
    });

    it('deve impedir actualização sem autenticação', async () => {
      const response = await request(app)
        .put('/studio-modalities/1')
        .send({ modalityId });

      expect(response.status).toBe(401);
    });
  });
});
