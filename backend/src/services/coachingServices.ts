import { z } from 'zod';
import { prisma } from '../config/db';
import { AppError } from '../utils/appError';
import { createClassService, addUserToClassService } from './classes/classesServices';

// ══ SCHEMAS ══

const requestCoachingSchema = z.object({
  modality_id:   z.coerce.number().int().positive(),
  studio_id:     z.coerce.number().int().positive(),
  professor_id:  z.coerce.number().int().positive(),
  student_id:    z.coerce.number().int().positive(),
  school_year_id: z.coerce.number().int().positive(),
  start_time:    z.string().min(1),
  end_time:      z.string().min(1),
});

const classIdSchema = z.object({
  classId: z.coerce.number().int().positive(),
});

const validateCoachingSchema = z.object({
  user_id:    z.coerce.number().int().positive(),
  validated:  z.boolean(),
});

// ══ FASE 1 ══

export const getAvailableStudiosService = async (modalityId: number) => {
  if (!modalityId) throw new AppError('modalityId é obrigatório.', 400);

  return prisma.studioModality.findMany({
    where: { modalityId },
    include: { studio: true, modality: true },
  });
};

export const getVacanciesService = async (professorId: number, schoolYearId: number) => {
  if (!professorId || !schoolYearId) {
    throw new AppError('professorId e schoolYearId são obrigatórios.', 400);
  }

  return prisma.scheduleVacancy.findMany({
    where: { userId: professorId, schoolYearId },
    include: {
      user: { select: { userName: true } },
      schoolYear: true,
    },
  });
};

export const requestCoachingService = async (body: unknown) => {
  const {
    modality_id,
    studio_id,
    professor_id,
    student_id,
    school_year_id,
    start_time,
    end_time,
  } = requestCoachingSchema.parse(body);

  // Verifica professor
  const professor = await prisma.user.findUnique({ where: { userId: professor_id } });
  if (!professor) throw new AppError('Professor não encontrado.', 404);

  // Verifica aluno
  const student = await prisma.user.findUnique({ where: { userId: student_id } });
  if (!student) throw new AppError('Aluno não encontrado.', 404);

  // Verifica estúdio + modalidade
  const studioModality = await prisma.studioModality.findFirst({
    where: { studioId: studio_id, modalityId: modality_id },
    include: { modality: true },
  });
  if (!studioModality) throw new AppError('Estúdio não disponível para esta modalidade.', 404);

  // Verifica disponibilidade do professor (ScheduleVacancy)
  const vacancy = await prisma.scheduleVacancy.findFirst({
    where: {
      userId: professor_id,
      schoolYearId: school_year_id,
      scheduleVacancyStart: { lte: new Date(`1970-01-01T${start_time}`) },
      scheduleVacancyEnd:   { gte: new Date(`1970-01-01T${end_time}`) },
    },
  });
  if (!vacancy) throw new AppError('Professor sem disponibilidade neste horário.', 409);

  // Busca estado "Agendada" e roles pelo nome (seed)
  const [agendadaStatus, professorRole, alunoRole] = await Promise.all([
    prisma.classStatus.findFirst({ where: { classStatusDesc: 'Agendada' } }),
    prisma.userClassRole.findFirst({ where: { userClassRoleDesc: 'Professor Responsável' } }),
    prisma.userClassRole.findFirst({ where: { userClassRoleDesc: 'Aluno' } }),
  ]);

  if (!agendadaStatus) throw new AppError('Estado "Agendada" não encontrado na DB.', 500);
  if (!professorRole)  throw new AppError('Role "Professor Responsável" não encontrado na DB.', 500);
  if (!alunoRole)      throw new AppError('Role "Aluno" não encontrado na DB.', 500);

  // Cria a aula reutilizando o service do colega
  const newClass = await createClassService({
    school_year_id,
    class_date_start: start_time,
    class_date_end:   end_time,
    studio_modality_id: studioModality.studioModalityId,
    class_final_fee: Number(studioModality.modality.modalityHourlyFee),
    class_status_id: agendadaStatus.classStatusId,
  });

  // Associa professor e aluno reutilizando o service do colega
  await addUserToClassService(
    { id: newClass.classId },
    { user_id: professor_id, user_class_role_id: professorRole.userClassRoleId }
  );

  await addUserToClassService(
    { id: newClass.classId },
    { user_id: student_id, user_class_role_id: alunoRole.userClassRoleId }
  );

  return {
    message: 'Pedido de coaching submetido com sucesso.',
    classId: newClass.classId,
  };
};

// ══ FASE 2 ══

export const confirmCoachingService = async (params: unknown) => {
  const { classId } = classIdSchema.parse(params);

  const existingClass = await prisma.class.findUnique({
    where: { classId },
    include: { classStatus: true, userClass: true },
  });
  if (!existingClass) throw new AppError('Aula não encontrada.', 404);

  if (existingClass.classStatus.classStatusDesc !== 'Agendada') {
    throw new AppError('Só é possível confirmar aulas no estado "Agendada".', 409);
  }

  const aDecorrerStatus = await prisma.classStatus.findFirst({
    where: { classStatusDesc: 'A Decorrer' },
  });
  if (!aDecorrerStatus) throw new AppError('Estado "A Decorrer" não encontrado na DB.', 500);

  return prisma.$transaction(async (tx) => {
    const updated = await tx.class.update({
      where: { classId },
      data: { classStatusId: aDecorrerStatus.classStatusId },
      include: {
        classStatus: true,
        studioModality: { include: { studio: true, modality: true } },
        userClass: { include: { user: true, userClassRole: true } },
      },
    });

    await tx.classStatusHistory.create({
      data: {
        classId,
        classStatusId: aDecorrerStatus.classStatusId,
        userId: existingClass.userClass[0]?.userId ?? 0,
        classStatusHistoryDate: new Date(),
      },
    });

    return { message: 'Coaching confirmado com sucesso.', class: updated };
  });
};

// ══ FASE 3 ══

export const validateCoachingService = async (params: unknown, body: unknown) => {
  const { classId } = classIdSchema.parse(params);
  const { user_id, validated } = validateCoachingSchema.parse(body);

  const existingClass = await prisma.class.findUnique({
    where: { classId },
    include: {
      classStatus: true,
      userClass: { include: { userClassRole: true } },
    },
  });
  if (!existingClass) throw new AppError('Aula não encontrada.', 404);

  if (existingClass.classStatus.classStatusDesc !== 'A Decorrer') {
    throw new AppError('Só é possível validar aulas no estado "A Decorrer".', 409);
  }

  // Verifica se o utilizador pertence à aula
  const userClass = existingClass.userClass.find(uc => uc.userId === user_id);
  if (!userClass) throw new AppError('Utilizador não está associado a esta aula.', 404);

  // Regista a validação deste utilizador
  await prisma.userClass.update({
    where: { classId_userId: { classId, userId: user_id } },
    data: { userValidation: validated },
  });

  // Verifica se todos validaram (dupla validação)
  const updatedUserClasses = await prisma.userClass.findMany({
    where: { classId },
  });

  const allValidated = updatedUserClasses.every(uc => uc.userValidation === true);
  const anyRejected  = updatedUserClasses.some(uc => uc.userValidation === false);

  // Só atualiza o estado final se todos já responderam
  const allResponded = updatedUserClasses.every(uc => uc.userValidation !== null);

  if (!allResponded) {
    return { message: 'Validação registada. A aguardar restantes validações.' };
  }

  // Busca estado final
  const finalStatus = await prisma.classStatus.findFirst({
    where: { classStatusDesc: allValidated ? 'Concluída' : 'Cancelada' },
  });
  if (!finalStatus) throw new AppError('Estado final não encontrado na DB.', 500);

  return prisma.$transaction(async (tx) => {
    const updated = await tx.class.update({
      where: { classId },
      data: { classStatusId: finalStatus.classStatusId },
      include: { classStatus: true },
    });

    await tx.classStatusHistory.create({
      data: {
        classId,
        classStatusId: finalStatus.classStatusId,
        userId: user_id,
        classStatusHistoryDate: new Date(),
      },
    });

    return {
      message: allValidated
        ? 'Coaching concluído com sucesso.'
        : 'Coaching cancelado por falta de validação.',
      approved: allValidated,
      class: updated,
    };
  });
};