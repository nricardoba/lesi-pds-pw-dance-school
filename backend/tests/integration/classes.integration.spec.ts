import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/index';
import { prisma } from '../../src/config/db';

describe('Testes de Integracao - CRUD de Aulas', () => {
  const adminLogin = {
    email: process.env.ADMIN_EMAIL ?? 'admin@admin.com',
    password: process.env.ADMIN_PASSWORD ?? 'Admin123!',
  };

  let accessToken = '';
  let classId: number | null = null;

  let classStatusId: number | null = null;
  let schoolYearId: number | null = null;
  let studioId: number | null = null;
  let modalityId: number | null = null;
  let studioModalityId: number | null = null;

  const uniqueSuffix = Date.now();

  // Preparar token de admin e dados base usados pelos testes.
  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/auth/login')
      .send(adminLogin);

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty('accessToken');
    accessToken = loginRes.body.accessToken;

    const classStatus = await prisma.classStatus.create({
      data: {
        classStatusDesc: `Teste CRUD ${uniqueSuffix}`,
      },
    });
    classStatusId = classStatus.classStatusId;

    const schoolYear = await prisma.schoolYear.create({
      data: {
        schoolYearName: `Ano Teste ${uniqueSuffix}`,
        schoolYearStart: new Date('2026-01-01'),
        schoolYearEnd: new Date('2026-12-31'),
      },
    });
    schoolYearId = schoolYear.schoolYearId;

    const studio = await prisma.studio.create({
      data: {
        studioName: `Estudio Teste ${uniqueSuffix}`,
        studioMaxCapacity: 20,
      },
    });
    studioId = studio.studioId;

    const modality = await prisma.modality.create({
      data: {
        modalityName: `Modalidade Teste ${uniqueSuffix}`,
        modalityHourlyFee: 15.5,
      },
    });
    modalityId = modality.modalityId;

    const studioModality = await prisma.studioModality.create({
      data: {
        studioId: studio.studioId,
        modalityId: modality.modalityId,
      },
    });
    studioModalityId = studioModality.studioModalityId;
  });

  // Limpar os registos criados durante os testes.
  afterAll(async () => {
    try {
      if (classId) {
        await prisma.class.delete({
          where: { classId },
        });
      }

      if (studioModalityId) {
        await prisma.studioModality.delete({
          where: { studioModalityId },
        });
      }

      if (studioId) {
        await prisma.studio.delete({
          where: { studioId },
        });
      }

      if (modalityId) {
        await prisma.modality.delete({
          where: { modalityId },
        });
      }

      if (schoolYearId) {
        await prisma.schoolYear.delete({
          where: { schoolYearId },
        });
      }

      if (classStatusId) {
        await prisma.classStatus.delete({
          where: { classStatusId },
        });
      }
    } finally {
      await prisma.$disconnect();
    }
  });

  // Cria uma aula valida e guarda o id retornado.
  it('deve criar uma aula com sucesso', async () => {
    const response = await request(app)
      .post('/classes')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        schoolYearId,
        classDateStart: '2026-05-01T10:00:00Z',
        classDateEnd: '2026-05-01T11:00:00Z',
        classRecurrence: false,
        studioModalityId,
        classFinalFee: 25.0,
        classStatusId,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('classId');

    classId = response.body.classId;
  });

  // Garante que o backend valida payload vazio.
  it('deve validar campos obrigatorios quando estao vazios', async () => {
    const response = await request(app)
      .post('/classes')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error.message).toBe('Preencha os campos obrigatórios.');
  });

  // Atualiza um campo simples para validar o endpoint de update.
  it('deve atualizar uma aula com sucesso', async () => {
    const response = await request(app)
      .put(`/classes/${classId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        classFinalFee: 30.0,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('classFinalFee');
  });

  // Confirma que a aula existe e pode ser lida por id.
  it('deve obter a aula atualizada', async () => {
    const response = await request(app)
      .get(`/classes/${classId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('classId', classId);
  });

  // Remove a aula e valida que o recurso deixa de existir.
  it('deve apagar a aula com sucesso', async () => {
    const response = await request(app)
      .delete(`/classes/${classId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(204);

    const checkResponse = await request(app)
      .get(`/classes/${classId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(checkResponse.status).toBe(404);
    classId = null;
  });
});
