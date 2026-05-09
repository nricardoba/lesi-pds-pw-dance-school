import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/index';
import { prisma } from '../../src/config/db';

describe('Testes de Integração - Studios', () => {
  const adminLogin = {
    email: process.env.ADMIN_EMAIL ?? 'admin@admin.com',
    password: process.env.ADMIN_PASSWORD ?? 'Admin123!',
  };

  let accessToken = '';
  let studioId: number | null = null;
  const uniqueSuffix = Date.now();

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/auth/login')
      .send(adminLogin);

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty('accessToken');
    accessToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    try {
      if (studioId) {
        // Delete all studio modalities first due to foreign key constraint
        try {
          await prisma.studioModality.deleteMany({
            where: { studioId },
          });
        } catch (e) {
          // Already deleted or no dependencies
        }
        // Then delete the studio
        try {
          await prisma.studio.delete({
            where: { studioId },
          });
        } catch (e) {
          // Already deleted in test
        }
      }
    } finally {
      await prisma.$disconnect();
    }
  });

  describe('CRUD de Studios', () => {
    it('1. deve criar um estúdio com sucesso', async () => {
      const newStudio = {
        studioName: `Estúdio Teste ${uniqueSuffix}`,
        studioMaxCapacity: 25,
      };

      const response = await request(app)
        .post('/studios')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newStudio);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('studioId');
      expect(response.body).toHaveProperty('studioName', newStudio.studioName);
      expect(response.body).toHaveProperty('studioMaxCapacity', newStudio.studioMaxCapacity);

      studioId = response.body.studioId;
    });

    it('2. deve listar todos os estúdios', async () => {
      const response = await request(app)
        .get('/studios')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('3. deve atualizar um estúdio com sucesso', async () => {
      const updateData = {
        studioName: `Estúdio Atualizado ${uniqueSuffix}`,
        studioMaxCapacity: 30,
      };

      const response = await request(app)
        .put(`/studios/${studioId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('studioName', updateData.studioName);
      expect(response.body).toHaveProperty('studioMaxCapacity', updateData.studioMaxCapacity);
    });

    it('4. deve retornar 404 ao atualizar estúdio inexistente', async () => {
      const updateData = { studioName: 'Novo Nome' };

      const response = await request(app)
        .put('/studios/999999')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('5. deve retornar 404 ao apagar estúdio inexistente', async () => {
      const response = await request(app)
        .delete('/studios/999999')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Validações e Autenticação', () => {
    it('deve impedir criação de estúdio sem autenticação', async () => {
      const newStudio = {
        studioName: 'Estúdio Teste',
        studioMaxCapacity: 20,
      };

      const response = await request(app)
        .post('/studios')
        .send(newStudio);

      expect(response.status).toBe(401);
    });

    it('deve impedir criação de estúdio com dados inválidos', async () => {
      const invalidStudio = {
        studioName: '',
        studioMaxCapacity: 'invalido',
      };

      const response = await request(app)
        .post('/studios')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(invalidStudio);

      expect(response.status).toBe(400);
    });

    it('deve impedir actualização de estúdio sem autenticação', async () => {
      const response = await request(app)
        .put('/studios/1')
        .send({ studioName: 'Novo Nome' });

      expect(response.status).toBe(401);
    });
  });
});
