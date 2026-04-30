import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/index';
import { prisma } from '../../src/config/db';

describe('Testes de Integracao - Modalidades', () => {
  const adminLogin = {
    email: process.env.ADMIN_EMAIL ?? 'admin@admin.com',
    password: process.env.ADMIN_PASSWORD ?? 'Admin123!',
  };

  let accessToken = '';
  let modalityId: number | null = null;
  const uniqueSuffix = Date.now();

  // Preparar token de admin e uma modalidade para o teste.
  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/auth/login')
      .send(adminLogin);

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty('accessToken');
    accessToken = loginRes.body.accessToken;

    const modality = await prisma.modality.create({
      data: {
        modalityName: `Modalidade Teste ${uniqueSuffix}`,
        modalityHourlyFee: 10.5,
      },
    });

    modalityId = modality.modalityId;
  });

  // Limpar os registos criados durante os testes.
  afterAll(async () => {
    try {
      if (modalityId) {
        await prisma.modality.delete({
          where: { modalityId },
        });
      }
    } finally {
      await prisma.$disconnect();
    }
  });

  // Deve retornar a modalidade quando o id existe.
  it('deve obter modalidade por id', async () => {
    const response = await request(app)
      .get(`/modalities/${modalityId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('modalityId', modalityId);
  });

  // Deve retornar 404 quando o id nao existe.
  it('deve retornar 404 para modalidade inexistente', async () => {
    const response = await request(app)
      .get('/modalities/999999')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error.message).toBe('Modalidade não encontrada.');
  });
});
