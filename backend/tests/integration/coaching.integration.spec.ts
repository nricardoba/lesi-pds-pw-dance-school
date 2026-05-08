import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/index';
import { prisma } from '../../src/config/db';

describe('Testes de Integração - Fluxo de Coaching', () => {
  const adminLogin = {
    email: 'admin@admin.com',
    password: 'Admin123!',
  };

  let accessToken = '';
  let coachingClassId: number;
  
  let schoolYearId: number;
  let modalityId: number;
  let realStudioId: number;

  // IDs fixos baseados no seu seed.ts
  const professorId = 2; 
  const studentId = 3;

  beforeAll(async () => {
    // 1. Obter Token de Autenticação
    const loginRes = await request(app).post('/auth/login').send(adminLogin);
    accessToken = loginRes.body.accessToken;

    // 2. Criar Ano Letivo
    const sy = await prisma.schoolYear.create({
      data: {
        schoolYearName: `Ano Teste ${Date.now()}`,
        schoolYearStart: new Date('2026-01-01'),
        schoolYearEnd: new Date('2026-12-31'),
      },
    });
    schoolYearId = sy.schoolYearId;

    // 3. Criar Modalidade
    const mod = await prisma.modality.create({
      data: {
        modalityName: `Mod Coaching ${Date.now()}`,
        modalityHourlyFee: 25.0,
      },
    });
    modalityId = mod.modalityId;

    // 4. Criar Disponibilidade para o Professor (Obrigatório para o Request)
    await prisma.scheduleVacancy.create({
      data: {
        userId: professorId,
        schoolYearId: schoolYearId,
        scheduleVacancyStart: new Date('2026-04-19T00:00:00Z'),
        scheduleVacancyEnd: new Date('2026-04-19T23:59:59Z'),
      },
    });

    // 5. Criar Estúdio Real para a fase de Confirmação
    const studio = await prisma.studio.create({
      data: {
        studioName: `Estúdio Real ${Date.now()}`,
        studioMaxCapacity: 5,
      },
    });
    realStudioId = studio.studioId;

    // Associar modalidade ao estúdio real
    await prisma.studioModality.create({
      data: {
        studioId: realStudioId,
        modalityId: modalityId,
      },
    });
  });

  afterAll(async () => {
    // Limpeza de dados por ordem de dependência
    if (coachingClassId) {
      await prisma.userClass.deleteMany({ where: { classId: coachingClassId } });
      await prisma.classStatusHistory.deleteMany({ where: { classId: coachingClassId } });
      await prisma.class.delete({ where: { classId: coachingClassId } });
    }
    await prisma.scheduleVacancy.deleteMany({ where: { schoolYearId } });
    await prisma.studioModality.deleteMany({ where: { modalityId } });
    await prisma.studio.deleteMany({ where: { studioId: realStudioId } });
    await prisma.modality.delete({ where: { modalityId } });
    await prisma.schoolYear.delete({ where: { schoolYearId } });
    await prisma.$disconnect();
  });

  // --- TESTES ---

  it('Fase 1: Deve solicitar um coaching com sucesso (Estado: Agendada)', async () => {
    const response = await request(app)
      .post('/coachings/request')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        modality_id: modalityId,
        professor_id: professorId,
        student_ids: [studentId],
        school_year_id: schoolYearId,
        start_time: "2026-04-19T10:00:00.000Z",
        end_time: "2026-04-19T11:00:00.000Z"
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('classId');
    coachingClassId = response.body.classId;
  });

  it('Fase 2: Deve confirmar o coaching e atribuir estúdio (Estado: A Decorrer)', async () => {
    const response = await request(app)
      .patch(`/coachings/${coachingClassId}/confirm`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        studio_id: realStudioId
      });

    expect(response.status).toBe(200);
    expect(response.body.class.classStatus.classStatusDesc).toBe('A Decorrer');
  });

  it('Fase 3: Deve validar a presença do utilizador (Professor)', async () => {
    const response = await request(app)
      .post(`/coachings/${coachingClassId}/validate`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        user_id: professorId
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toContain('confirmada');
  });

  it('Fase 4: Deve fechar o coaching como Concluída (Coordenação)', async () => {
    const response = await request(app)
      .post(`/coachings/${coachingClassId}/close`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        finalStatus: "Concluída"
      });

    expect(response.status).toBe(200);
    expect(response.body.finalStatus).toBe('Concluída');
    expect(response.body.approved).toBe(true);
  });

  it('Regra: Não deve permitir validar presenças em aulas já fechadas', async () => {
    const response = await request(app)
      .post(`/coachings/${coachingClassId}/validate`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        user_id: studentId
      });

    expect(response.status).toBe(409);
    expect(response.body.error.message).toContain('A Decorrer');
  });
});
