import { z } from 'zod';
import { prisma } from '../../config/db';
import { AppError } from '../../utils/appError';
import { createClassService, addUserToClassService } from './classesServices';
 
// ══ SCHEMAS ══
 
const requestCoachingSchema = z.object({
  modality_id:            z.coerce.number().int().positive(),
  studio_id:              z.coerce.number().int().positive(),
  professor_id:           z.coerce.number().int().positive(),
  assistant_professor_id: z.coerce.number().int().positive().optional().nullable(),
  student_ids:            z.array(z.coerce.number().int().positive()).min(1),
  school_year_id:         z.coerce.number().int().positive(),
  start_time:             z.string().datetime(), // ex: "2026-04-19T10:00:00Z"
  end_time:               z.string().datetime(),
});
 
const classIdSchema = z.object({
  classId: z.coerce.number().int().positive(),
});
 
const validateCoachingSchema = z.object({
  user_id:   z.coerce.number().int().positive(),
  validated: z.boolean(),
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
    assistant_professor_id,
    student_ids,
    school_year_id,
    start_time,
    end_time,
  } = requestCoachingSchema.parse(body);
 
  const startDate = new Date(start_time);
  const endDate   = new Date(end_time);
 
  // Verifica que o fim é depois do início
  if (endDate <= startDate) {
    throw new AppError('A hora de fim deve ser posterior à hora de início.', 400);
  }
 
  // Verifica professor responsável
  const professor = await prisma.user.findUnique({ where: { userId: professor_id } });
  if (!professor) throw new AppError('Professor não encontrado.', 404);
 
  // Verifica professor assistente (se enviado)
  if (assistant_professor_id) {
    const assistant = await prisma.user.findUnique({ where: { userId: assistant_professor_id } });
    if (!assistant) throw new AppError('Professor assistente não encontrado.', 404);
 
    if (assistant_professor_id === professor_id) {
      throw new AppError('Professor responsável e assistente não podem ser o mesmo utilizador.', 409);
    }
 
    // Verifica disponibilidade do professor assistente
    const assistantVacancy = await prisma.scheduleVacancy.findFirst({
      where: {
        userId: assistant_professor_id,
        schoolYearId: school_year_id,
        scheduleVacancyStart: { lte: startDate },
        scheduleVacancyEnd:   { gte: endDate },
      },
    });
    if (!assistantVacancy) throw new AppError('Professor assistente sem disponibilidade neste horário.', 409);
  }
 
  // Verifica todos os alunos de uma vez
  const students = await prisma.user.findMany({
    where: { userId: { in: student_ids } },
  });
 
  if (students.length !== student_ids.length) {
    const foundIds = students.map(s => s.userId);
    const missingIds = student_ids.filter(id => !foundIds.includes(id));
    throw new AppError(`Alunos não encontrados: ${missingIds.join(', ')}`, 404);
  }
 
  // Verifica estúdio + modalidade
  const studioModality = await prisma.studioModality.findFirst({
    where: { studioId: studio_id, modalityId: modality_id },
    include: { modality: true, studio: true },
  });
  if (!studioModality) throw new AppError('Estúdio não disponível para esta modalidade.', 404);
 
  // Verifica capacidade do estúdio
  const totalParticipants = 1 + (assistant_professor_id ? 1 : 0) + student_ids.length;
  if (totalParticipants > studioModality.studio.studioMaxCapacity) {
    throw new AppError(
      `Número de participantes (${totalParticipants}) excede a capacidade do estúdio (${studioModality.studio.studioMaxCapacity}).`,
      409
    );
  }
 
  // Verifica disponibilidade do professor responsável
  const vacancy = await prisma.scheduleVacancy.findFirst({
    where: {
      userId: professor_id,
      schoolYearId: school_year_id,
      scheduleVacancyStart: { lte: startDate },
      scheduleVacancyEnd:   { gte: endDate },
    },
  });
  if (!vacancy) throw new AppError('Professor sem disponibilidade neste horário.', 409);
 
  // Busca estado e roles pelo nome (seed)
  const [agendadaStatus, professorRole, assistantRole, alunoRole] = await Promise.all([
    prisma.classStatus.findFirst({ where: { classStatusDesc: 'Agendada' } }),
    prisma.userClassRole.findFirst({ where: { userClassRoleDesc: 'Professor Responsável' } }),
    prisma.userClassRole.findFirst({ where: { userClassRoleDesc: 'Professor Assistente' } }),
    prisma.userClassRole.findFirst({ where: { userClassRoleDesc: 'Aluno' } }),
  ]);
 
  if (!agendadaStatus) throw new AppError('Estado "Agendada" não encontrado na DB.', 500);
  if (!professorRole)  throw new AppError('Role "Professor Responsável" não encontrado na DB.', 500);
  if (!assistantRole)  throw new AppError('Role "Professor Assistente" não encontrado na DB.', 500);
  if (!alunoRole)      throw new AppError('Role "Aluno" não encontrado na DB.', 500);
 
  // Cria a aula
  const newClass = await createClassService({
    schoolYearId:     school_year_id,
    classDateStart:   start_time,
    classDateEnd:     end_time,
    studioModalityId: studioModality.studioModalityId,
    classFinalFee:    Number(studioModality.modality.modalityHourlyFee),
    classStatusId:    agendadaStatus.classStatusId,
  });
 
  // Associa professor responsável
  await addUserToClassService(
    { id: newClass.classId },
    { userId: professor_id, userClassRoleId: professorRole.userClassRoleId }
  );
 
  // Associa professor assistente (se existir)
  if (assistant_professor_id) {
    await addUserToClassService(
      { id: newClass.classId },
      { userId: assistant_professor_id, userClassRoleId: assistantRole.userClassRoleId }
    );
  }
 
  // Associa todos os alunos
  for (const studentId of student_ids) {
    await addUserToClassService(
      { id: newClass.classId },
      { userId: studentId, userClassRoleId: alunoRole.userClassRoleId }
    );
  }
 
  return {
    message: 'Pedido de coaching submetido com sucesso.',
    classId: newClass.classId,
    totalParticipants,
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
 
// REGRA DE NEGÓCIO:
// - Validam: professor responsável + professor assistente (se existir) + todos os alunos
// - O sistema aguarda sempre que TODOS respondam antes de decidir
// - Decisão final:
//     → pelo menos 1 professor confirmou (true)  = 'Concluída'
//     → todos os professores rejeitaram (false)   = 'Cancelada'
//     → aluno false = apenas ausência, não cancela a aula
// - Enquanto houver participantes com userValidation === null, mantém-se 'A Decorrer'
 
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
 
  // Verifica se o utilizador já validou
  if (userClass.userValidation !== null) {
    throw new AppError('Este utilizador já submeteu a sua validação.', 409);
  }
 
  // Regista a validação deste utilizador
  await prisma.userClass.update({
    where: { classId_userId: { classId, userId: user_id } },
    data: { userValidation: validated },
  });
 
  // Reler estado atualizado de todos os participantes
  const updatedUserClasses = await prisma.userClass.findMany({
    where: { classId },
    include: { userClassRole: true },
  });
 
  // Todos os participantes validam:
  // professor responsável + professor assistente (se existir) + alunos
  const validatingRoles = ['Professor Responsável', 'Professor Assistente', 'Aluno'];
  const relevantUserClasses = updatedUserClasses.filter(
    uc => validatingRoles.includes(uc.userClassRole?.userClassRoleDesc ?? '')
  );
 
  // Aguarda que todos respondam antes de decidir estado final
  const allResponded = relevantUserClasses.every(uc => uc.userValidation !== null);
 
  if (!allResponded) {
    const pending = relevantUserClasses.filter(uc => uc.userValidation === null).length;
    return {
      message: `Validação registada. A aguardar ${pending} validação(ões).`,
    };
  }
 
  // ── DECISÃO FINAL ──
 
  const professorRoles = ['Professor Responsável', 'Professor Assistente'];
 
  // Conclui se pelo menos 1 professor confirmou presença
  const anyProfessorConfirmed = relevantUserClasses.some(
    uc => professorRoles.includes(uc.userClassRole?.userClassRoleDesc ?? '')
       && uc.userValidation === true
  );
 
  // Alunos que faltaram (false) — registados mas não cancelam a aula
  const absentStudents = relevantUserClasses.filter(
    uc => uc.userClassRole?.userClassRoleDesc === 'Aluno'
       && uc.userValidation === false
  );
 
  const finalStatusDesc = anyProfessorConfirmed ? 'Concluída' : 'Cancelada';
 
  const finalStatus = await prisma.classStatus.findFirst({
    where: { classStatusDesc: finalStatusDesc },
  });
  if (!finalStatus) throw new AppError(`Estado "${finalStatusDesc}" não encontrado na DB.`, 500);
 
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
      message: anyProfessorConfirmed
        ? absentStudents.length > 0
          ? `Coaching concluído com sucesso. ${absentStudents.length} aluno(s) ausente(s).`
          : 'Coaching concluído com sucesso.'
        : 'Coaching cancelado com sucesso.',
      approved: anyProfessorConfirmed,
      absentStudents: absentStudents.map(uc => uc.userId),
      class: updated,
    };
  });
};