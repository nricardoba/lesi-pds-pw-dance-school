import { z } from "zod";
import { prisma } from "../../config/db";
import { AppError } from "../../utils/appError";
import {
  getUserByIdService,
  getUsersByIdsService,
} from "../users/usersServices";
import { getScheduleVacanciesByUserIdService } from "../school/scheduleVacancyServices";

const classIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const coachingClassIdSchema = z.object({
  classId: z.coerce.number().int().positive(),
});

const classUserParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
  userId: z.coerce.number().int().positive(),
});

const createClassSchema = z.object({
  schoolYearId: z.coerce.number().int().positive(),
  classDateStart: z.string().min(1),
  classDateEnd: z.string().min(1),
  classRecurrence: z.boolean().optional().nullable(),
  studioModalityId: z.coerce.number().int().positive().optional(),
  studioId: z.coerce.number().int().positive().optional(),
  modalityId: z.coerce.number().int().positive().optional(),
  classFinalFee: z.coerce.number().nonnegative(),
  classStatusId: z.coerce.number().int().positive(),
});

const createUserClassSchema = z.object({
  userId: z.coerce.number().int().positive(),
  userClassRoleId: z.coerce.number().int().positive().optional().nullable(),
  userValidation: z.boolean().optional(),
});

const updateClassSchema = z.object({
  schoolYearId: z.coerce.number().int().positive().optional(),
  classDateStart: z.string().min(1).optional(),
  classDateEnd: z.string().min(1).optional(),
  classRecurrence: z.boolean().optional().nullable(),
  studioModalityId: z.coerce.number().int().positive().optional(),
  studioId: z.coerce.number().int().positive().optional(),
  modalityId: z.coerce.number().int().positive().optional(),
  classFinalFee: z.coerce.number().nonnegative().optional(),
  classStatusId: z.coerce.number().int().positive().optional(),
  instructorId: z.coerce.number().int().positive().optional().nullable(),
});

const updateUserClassSchema = z.object({
  userClassRoleId: z.coerce.number().int().positive().optional().nullable(),
  userValidation: z.boolean().optional(),
});

const requestCoachingSchema = z.object({
  modality_id: z.coerce.number().int().positive(),
  professor_id: z.coerce.number().int().positive(),
  assistant_professor_id: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .nullable(),
  student_ids: z.array(z.coerce.number().int().positive()).min(1),
  school_year_id: z.coerce.number().int().positive(),
  start_time: z.string().datetime(), // ex: "2026-04-19T10:00:00Z"
  end_time: z.string().datetime(),
});

const validateCoachingSchema = z.object({
  user_id: z.coerce.number().int().positive(),
});

const confirmCoachingSchema = z.object({
  studio_id: z.coerce.number().int().positive(),
});

const closeCoachingSchema = z.object({
  finalStatus: z.enum(["Concluída", "Cancelada"]).optional(),
});
export const listClassesService = async () => {
  return prisma.class.findMany({
    include: {
      classStatus: true,
      schoolYear: true,
      studioModality: {
        include: {
          studio: true,
          modality: true,
        },
      },
      userClass: {
        include: {
          user: true,
          userClassRole: true,
        },
      },
    },
    orderBy: {
      classId: "asc",
    },
  });
};

export const getClassByIdService = async (params: unknown) => {
  const { id } = classIdSchema.parse(params);

  const classItem = await prisma.class.findUnique({
    where: { classId: id },
    include: {
      classStatus: true,
      schoolYear: true,
      studioModality: {
        include: {
          studio: true,
          modality: true,
        },
      },
      userClass: {
        include: {
          user: true,
          userClassRole: true,
        },
      },
    },
  });

  if (!classItem) {
    throw new AppError("Aula não encontrada.", 404);
  }

  return classItem;
};

export const createClassService = async (body: unknown) => {
  let {
    schoolYearId,
    classDateStart,
    classDateEnd,
    classRecurrence,
    studioModalityId,
    studioId,
    modalityId,
    classFinalFee,
    classStatusId,
  } = createClassSchema.parse(body);

  if (!studioModalityId && studioId && modalityId) {
    let sm = await prisma.studioModality.findFirst({
      where: { studioId: studioId, modalityId: modalityId }
    });
    
    // Se a associação não existir, contornamos o erro criando-a automaticamente 
    // para facilitar que a aula seja gravada de imediato
    if (!sm) {
      sm = await prisma.studioModality.create({
        data: {
          studioId: studioId,
          modalityId: modalityId
        }
      });
    }
    studioModalityId = sm.studioModalityId;
  } else if (!studioModalityId) {
      // Just fallback for hardcoded frontend requests if they forgot to change
      const sm = await prisma.studioModality.findFirst();
      if (!sm) throw new AppError("Salo/Modalidade indisponível.", 400);
      studioModalityId = sm.studioModalityId;
  }

  // To fix frontend sending hardcoded 'schoolYearId: 1' which might not exist
  const yearExists = await prisma.schoolYear.findUnique({ where: { schoolYearId } });
  if (!yearExists) {
    const defaultYear = await prisma.schoolYear.findFirst();
    if (!defaultYear) throw new AppError("Ano letivo indisponível.", 400);
    schoolYearId = defaultYear.schoolYearId;
  }

  return prisma.class.create({
    data: {
      schoolYearId,
      classDateStart: new Date(classDateStart),
      classDateEnd: new Date(classDateEnd),
      classRecurrence: classRecurrence ?? false,
      studioModalityId,
      classFinalFee,
      classStatusId,
    },
    include: {
      classStatus: true,
      schoolYear: true,
      studioModality: {
        include: {
          studio: true,
          modality: true,
        },
      },
    },
  });
};

export const addUserToClassService = async (params: unknown, body: unknown) => {
  const { id } = classIdSchema.parse(params);
  const { userId, userClassRoleId, userValidation } =
    createUserClassSchema.parse(body);

  const existingClass = await prisma.class.findUnique({
    where: { classId: id },
    select: { classId: true },
  });

  if (!existingClass) {
    throw new AppError("Aula não encontrada.", 404);
  }

  const existingUser = await prisma.user.findUnique({
    where: { userId },
    select: { userId: true },
  });

  if (!existingUser) {
    throw new AppError("Utilizador não encontrado.", 404);
  }

  return prisma.userClass.create({
    data: {
      classId: id,
      userId,
      userClassRoleId: userClassRoleId ?? null,
      userValidation: userValidation ?? false,
    },
    include: {
      user: true,
      class: true,
      userClassRole: true,
    },
  });
};

export const updateClassService = async (params: unknown, body: unknown) => {
  const { id } = classIdSchema.parse(params);
  const parsedBody = updateClassSchema.parse(body);

  const existingClass = await prisma.class.findUnique({
    where: { classId: id },
    include: {
      userClass: {
        include: {
          userClassRole: true,
        },
      },
    },
  });

  if (!existingClass) {
    throw new AppError("Aula não encontrada.", 404);
  }

  const dataToUpdate: Record<string, unknown> = {};

  if (parsedBody.schoolYearId !== undefined) {
    dataToUpdate.schoolYearId = parsedBody.schoolYearId;
  }

  if (parsedBody.classDateStart !== undefined) {
    dataToUpdate.classDateStart = new Date(parsedBody.classDateStart);
  }

  if (parsedBody.classDateEnd !== undefined) {
    dataToUpdate.classDateEnd = new Date(parsedBody.classDateEnd);
  }

  if (parsedBody.classRecurrence !== undefined) {
    dataToUpdate.classRecurrence = parsedBody.classRecurrence;
  }

  if (parsedBody.studioModalityId !== undefined) {
    dataToUpdate.studioModalityId = parsedBody.studioModalityId;
  }

  if (!dataToUpdate.studioModalityId && parsedBody.studioId && parsedBody.modalityId) {
    let studioModality = await prisma.studioModality.findFirst({
      where: {
        studioId: parsedBody.studioId,
        modalityId: parsedBody.modalityId,
      },
    });

    if (!studioModality) {
      studioModality = await prisma.studioModality.create({
        data: {
          studioId: parsedBody.studioId,
          modalityId: parsedBody.modalityId,
        },
      });
    }

    dataToUpdate.studioModalityId = studioModality.studioModalityId;
  }

  if (parsedBody.classFinalFee !== undefined) {
    dataToUpdate.classFinalFee = parsedBody.classFinalFee;
  }

  if (parsedBody.classStatusId !== undefined) {
    dataToUpdate.classStatusId = parsedBody.classStatusId;
  }

  const professorRole = await prisma.userClassRole.findFirst({
    where: {
      userClassRoleDesc: "Professor Responsável",
    },
  });

  if (!professorRole) {
    throw new AppError('Role "Professor Responsável" não encontrado na DB.', 500);
  }

  return prisma.$transaction(async (tx) => {
    const updatedClass = await tx.class.update({
      where: { classId: id },
      data: dataToUpdate,
      include: {
        classStatus: true,
        schoolYear: true,
        studioModality: {
          include: {
            studio: true,
            modality: true,
          },
        },
        userClass: {
          include: {
            user: true,
            userClassRole: true,
          },
        },
      },
    });

    if (parsedBody.instructorId != null) {
      const existingProfessorLinks = existingClass.userClass.filter(
        (uc) =>
          uc.userClassRole?.userClassRoleDesc === "Professor Responsável" ||
          uc.userClassRole?.userClassRoleDesc === "Professor Assistente"
      );

      if (existingProfessorLinks.length > 0) {
        await tx.userClass.deleteMany({
          where: {
            classId: id,
            userId: {
              in: existingProfessorLinks.map((uc) => uc.userId),
            },
          },
        });
      }

      await tx.userClass.create({
        data: {
          classId: id,
          userId: parsedBody.instructorId as number,
          userClassRoleId: professorRole.userClassRoleId,
          userValidation: false,
        },
      });
    }

    return tx.class.findUnique({
      where: { classId: id },
      include: {
        classStatus: true,
        schoolYear: true,
        studioModality: {
          include: {
            studio: true,
            modality: true,
          },
        },
        userClass: {
          include: {
            user: true,
            userClassRole: true,
          },
        },
      },
    });
  });
};

export const deleteClassService = async (params: unknown) => {
  const { id } = classIdSchema.parse(params);

  const existingClass = await prisma.class.findUnique({
    where: { classId: id },
    select: { classId: true },
  });

  if (!existingClass) {
    throw new AppError("Aula não encontrada.", 404);
  }

  await prisma.class.delete({
    where: { classId: id },
  });

  return null;
};

export const updateUserClassService = async (
  params: unknown,
  body: unknown
) => {
  const { id, userId } = classUserParamsSchema.parse(params);
  const parsedBody = updateUserClassSchema.parse(body);

  return prisma.userClass.update({
    where: {
      classId_userId: { classId: id, userId },
    },
    data: {
      ...(parsedBody.userClassRoleId !== undefined
        ? { userClassRoleId: parsedBody.userClassRoleId }
        : {}),
      ...(parsedBody.userValidation !== undefined
        ? { userValidation: parsedBody.userValidation }
        : {}),
    },
    include: {
      userClassRole: true,
      user: true,
      class: true,
    },
  });
};

export const removeUserFromClassService = async (params: unknown) => {
  const { id, userId } = classUserParamsSchema.parse(params);

  await prisma.userClass.delete({
    where: {
      classId_userId: { classId: id, userId },
    },
  });

  return null;
};


// coaching services
export const requestCoachingService = async (body: unknown) => {
  const {
    modality_id,
    professor_id,
    assistant_professor_id,
    student_ids,
    school_year_id,
    start_time,
    end_time,
  } = requestCoachingSchema.parse(body);

  const startDate = new Date(start_time);
  const endDate = new Date(end_time);

  // Verifica que o fim é depois do início
  if (endDate <= startDate) {
    throw new AppError(
      "A hora de fim deve ser posterior à hora de início.",
      400,
    );
  }

  // Verifica professor responsável
  try {
    await getUserByIdService({ id: professor_id });
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 404) {
      throw new AppError("Professor não encontrado.", 404);
    }
    throw error;
  }

  // Verifica professor assistente (se enviado)
  if (assistant_professor_id) {
    try {
      await getUserByIdService({ id: assistant_professor_id });
    } catch (error) {
      if (error instanceof AppError && error.statusCode === 404) {
        throw new AppError("Professor assistente não encontrado.", 404);
      }
      throw error;
    }

    if (assistant_professor_id === professor_id) {
      throw new AppError(
        "Professor responsável e assistente não podem ser o mesmo utilizador.",
        409,
      );
    }

    // Verifica disponibilidade do professor assistente
    const assistantVacancies = await getScheduleVacanciesByUserIdService(
      assistant_professor_id,
    );
    const assistantVacancy = assistantVacancies.find(
      (item) =>
        item.schoolYearId === school_year_id &&
        item.scheduleVacancyStart <= startDate &&
        item.scheduleVacancyEnd >= endDate,
    );
    if (!assistantVacancy)
      throw new AppError(
        "Professor assistente sem disponibilidade neste horário.",
        409,
      );
  }

  // Verifica todos os alunos de uma vez
  const students = await getUsersByIdsService(student_ids);

  if (students.length !== student_ids.length) {
    const foundIds = students.map((s) => s.userId);
    const missingIds = student_ids.filter((id) => !foundIds.includes(id));
    throw new AppError(`Alunos não encontrados: ${missingIds.join(", ")}`, 404);
  }

  // Verifica estúdio "A Definir" + modalidade (cria se não existir)
  let placeholderStudio = await prisma.studio.findFirst({
    where: { studioName: "A Definir" },
  });

  if (!placeholderStudio) {
    placeholderStudio = await prisma.studio.create({
      data: {
        studioName: "A Definir",
        studioMaxCapacity: 999,
      },
    });
  }

  let studioModality = await prisma.studioModality.findFirst({
    where: { studioId: placeholderStudio.studioId, modalityId: modality_id },
    include: { modality: true, studio: true },
  });

  if (!studioModality) {
    studioModality = await prisma.studioModality.create({
      data: {
        studioId: placeholderStudio.studioId,
        modalityId: modality_id,
      },
      include: { modality: true, studio: true },
    });
  }

  const totalParticipants =
    1 + (assistant_professor_id ? 1 : 0) + student_ids.length;
  // A verificação de capacidade é ignorada porque o estúdio é "A Definir" com 999 de capacidade.

  // Verifica disponibilidade do professor responsável
  const professorVacancies = await getScheduleVacanciesByUserIdService(
    professor_id,
  );
  const vacancy = professorVacancies.find(
    (item) =>
      item.schoolYearId === school_year_id &&
      item.scheduleVacancyStart <= startDate &&
      item.scheduleVacancyEnd >= endDate,
  );
  if (!vacancy)
    throw new AppError("Professor sem disponibilidade neste horário.", 409);

  // Busca estado e roles pelo nome (seed)
  const [agendadaStatus, professorRole, assistantRole, alunoRole] =
    await Promise.all([
      prisma.classStatus.findFirst({ where: { classStatusDesc: "Agendada" } }),
      prisma.userClassRole.findFirst({
        where: { userClassRoleDesc: "Professor Responsável" },
      }),
      prisma.userClassRole.findFirst({
        where: { userClassRoleDesc: "Professor Assistente" },
      }),
      prisma.userClassRole.findFirst({ where: { userClassRoleDesc: "Aluno" } }),
    ]);

  if (!agendadaStatus)
    throw new AppError('Estado "Agendada" não encontrado na DB.', 500);
  if (!professorRole)
    throw new AppError(
      'Role "Professor Responsável" não encontrado na DB.',
      500,
    );
  if (!assistantRole)
    throw new AppError(
      'Role "Professor Assistente" não encontrado na DB.',
      500,
    );
  if (!alunoRole) throw new AppError('Role "Aluno" não encontrado na DB.', 500);

  // Cria a aula
  const newClass = await createClassService({
    schoolYearId: school_year_id,
    classDateStart: start_time,
    classDateEnd: end_time,
    studioModalityId: studioModality.studioModalityId,
    classFinalFee: Number(studioModality.modality.modalityHourlyFee),
    classStatusId: agendadaStatus.classStatusId,
  });

  // Associa professor responsável
  await addUserToClassService(
    { id: newClass.classId },
    { userId: professor_id, userClassRoleId: professorRole.userClassRoleId },
  );

  // Associa professor assistente (se existir)
  if (assistant_professor_id) {
    await addUserToClassService(
      { id: newClass.classId },
      { userId: assistant_professor_id, userClassRoleId: assistantRole.userClassRoleId },
    );
  }

  // Associa todos os alunos
  for (const studentId of student_ids) {
    await addUserToClassService(
      { id: newClass.classId },
      { userId: studentId, userClassRoleId: alunoRole.userClassRoleId },
    );
  }

  return {
    message: "Pedido de coaching submetido com sucesso.",
    classId: newClass.classId,
    totalParticipants,
  };
};

// ══ FASE 2 ══

export const confirmCoachingService = async (params: unknown, body: unknown) => {
  const { classId } = coachingClassIdSchema.parse(params);
  const { studio_id } = confirmCoachingSchema.parse(body);

  const existingClass = await prisma.class.findUnique({
    where: { classId },
    include: { 
      classStatus: true, 
      userClass: true,
      studioModality: { include: { modality: true } } 
    },
  });
  if (!existingClass) throw new AppError("Aula não encontrada.", 404);

  if (existingClass.classStatus.classStatusDesc !== "Agendada") {
    throw new AppError(
      'Só é possível confirmar aulas no estado "Agendada".',
      409,
    );
  }

  // Verifica novo estúdio + modalidade
  const realStudioModality = await prisma.studioModality.findFirst({
    where: { 
      studioId: studio_id, 
      modalityId: existingClass.studioModality.modalityId 
    },
    include: { studio: true },
  });
  if (!realStudioModality) {
    throw new AppError("Estúdio selecionado não disponível para esta modalidade.", 404);
  }

  // Verifica capacidade do estúdio selecionado
  const totalParticipants = existingClass.userClass.length;
  if (totalParticipants > realStudioModality.studio.studioMaxCapacity) {
    throw new AppError(
      `Número de participantes (${totalParticipants}) excede a capacidade do estúdio selecionado (${realStudioModality.studio.studioMaxCapacity}).`,
      409,
    );
  }

  const aDecorrerStatus = await prisma.classStatus.findFirst({
    where: { classStatusDesc: "A Decorrer" },
  });
  if (!aDecorrerStatus)
    throw new AppError('Estado "A Decorrer" não encontrado na DB.', 500);

  return prisma.$transaction(async (tx) => {
    const updated = await tx.class.update({
      where: { classId },
      data: { 
        classStatusId: aDecorrerStatus.classStatusId,
        studioModalityId: realStudioModality.studioModalityId
      },
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

    return { message: "Coaching confirmado com sucesso.", class: updated };
  });
};

// ══ FASE 3 ══

// REGRA DE NEGÓCIO:
// - userValidation = false (por defeito) significa "ainda não confirmou presença"
// - userValidation = true significa "confirmou presença"
// - Não existe rejeição explícita — as 48h são uma regra comunicada aos utilizadores
//   mas não imposta tecnicamente (não bloqueia confirmações tardias, apenas a coordenação tem a decisão final)
// - Decisão final (chamada pela coordenação):
//     → pelo menos 1 professor confirmou (true)  = 'Concluída'
//     → nenhum professor confirmou               = 'Cancelada'
//     → alunos com false                         = ausentes registados, não cancela

export const validateCoachingService = async (
  params: unknown,
  body: unknown,
) => {
  const { classId } = coachingClassIdSchema.parse(params);
  const { user_id } = validateCoachingSchema.parse(body);

  const existingClass = await prisma.class.findUnique({
    where: { classId },
    include: {
      classStatus: true,
      userClass: { include: { userClassRole: true } },
    },
  });
  if (!existingClass) throw new AppError("Aula não encontrada.", 404);

  if (existingClass.classStatus.classStatusDesc !== "A Decorrer") {
    throw new AppError(
      'Só é possível validar aulas no estado "A Decorrer".',
      409,
    );
  }

  // Verifica se o utilizador pertence à aula
  const userClass = existingClass.userClass.find((uc) => uc.userId === user_id);
  if (!userClass)
    throw new AppError("Utilizador não está associado a esta aula.", 404);

  // Verifica se já confirmou
  if (userClass.userValidation === true) {
    throw new AppError("Este utilizador já confirmou a sua presença.", 409);
  }

  // Confirma presença — só true, não há rejeição explícita
  await prisma.userClass.update({
    where: { classId_userId: { classId, userId: user_id } },
    data: { userValidation: true },
  });

  return {
    message: "Presença confirmada com sucesso.",
    classId,
    userId: user_id,
  };
};

// ══ FECHO DE VALIDAÇÃO (chamado pela coordenação) ══

// REGRA DE NEGÓCIO:
// - Chamado manualmente pela coordenação após as 48h
// - Verifica quem confirmou e decide o estado final
// - A direção pode optar por fechar como "Concluída" mesmo sem confirmações, caso haja justificações (ex: problemas técnicos, imprevistos) — nesse caso, o campo finalStatus é obrigatório e deve ser "Concluída" ou "Cancelada"

export const closeCoachingValidationService = async (
  params: unknown,
  body: unknown,
  closedBy: number,
) => {
  const { classId } = coachingClassIdSchema.parse(params);

  if (body !== undefined && body !== null && typeof body !== "object") {
    throw new AppError("Payload inválido.", 400);
  }
  const { finalStatus: requestedFinalStatus } = closeCoachingSchema.parse(body ?? {});

  try {
    await getUserByIdService({ id: closedBy });
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 404) {
      throw new AppError("Utilizador responsável pelo fecho não encontrado.", 404);
    }
    throw error;
  }

  const existingClass = await prisma.class.findUnique({
    where: { classId },
    include: {
      classStatus: true,
      userClass: { include: { userClassRole: true } },
    },
  });
  if (!existingClass) throw new AppError("Aula não encontrada.", 404);

  if (existingClass.classStatus.classStatusDesc !== "A Decorrer") {
    throw new AppError(
      'Só é possível fechar validações de aulas no estado "A Decorrer".',
      409,
    );
  }

  const professorRoles = ["Professor Responsável", "Professor Assistente"];

  // Pelo menos 1 professor confirmou → Concluída
  const anyProfessorConfirmed = existingClass.userClass.some(
    (uc) =>
      professorRoles.includes(uc.userClassRole?.userClassRoleDesc ?? "") &&
      uc.userValidation === true,
  );

  // Alunos que não confirmaram → ausentes
  const absentStudents = existingClass.userClass.filter(
    (uc) =>
      uc.userClassRole?.userClassRoleDesc === "Aluno" &&
      uc.userValidation === false,
  );

  const finalStatusDesc =
    requestedFinalStatus ?? (anyProfessorConfirmed ? "Concluída" : "Cancelada");

  const finalStatusRecord = await prisma.classStatus.findFirst({
    where: { classStatusDesc: finalStatusDesc },
  });
  if (!finalStatusRecord)
    throw new AppError(
      `Estado "${finalStatusDesc}" não encontrado na DB.`,
      500,
    );

  return prisma.$transaction(async (tx) => {
    const updated = await tx.class.update({
      where: { classId },
      data: { classStatusId: finalStatusRecord.classStatusId },
      include: { classStatus: true },
    });

    await tx.classStatusHistory.create({
      data: {
        classId,
        classStatusId: finalStatusRecord.classStatusId,
        userId: closedBy,
        classStatusHistoryDate: new Date(),
      },
    });

    if (absentStudents.length > 0) {
      await tx.userClass.updateMany({
        where: {
          classId,
          userId: { in: absentStudents.map((uc) => uc.userId) },
        },
        data: { userValidation: false },
      });
    }

    const absentSuffix =
      absentStudents.length > 0
        ? ` ${absentStudents.length} aluno(s) marcado(s) como ausente(s).`
        : "";

    let message: string;
    if (finalStatusDesc === "Concluída") {
      if (requestedFinalStatus === "Concluída" && !anyProfessorConfirmed) {
        // Coordenação forçou "Concluída" sem confirmação de professor
        message = `Coaching concluído pela coordenação (sem confirmação de professor).${absentSuffix}`;
      } else {
        message =
          absentStudents.length > 0
            ? `Coaching concluído. ${absentStudents.length} aluno(s) marcado(s) como ausente(s).`
            : "Coaching concluído com sucesso.";
      }
    } else {
      // finalStatusDesc === "Cancelada"
      if (requestedFinalStatus === "Cancelada") {
        // Coordenação forçou cancelamento (pode ter sido mesmo com professor confirmado)
        message = anyProfessorConfirmed
          ? `Coaching cancelado pela coordenação (apesar da confirmação de professor).${absentSuffix}`
          : `Coaching cancelado pela coordenação.${absentSuffix}`;
      } else {
        // Cancelamento automático — nenhum professor confirmou
        message = `Coaching cancelado — nenhum professor confirmou a realização da aula.${absentSuffix}`;
      }
    }

    return {
      message,
      approved: finalStatusDesc === "Concluída",
      finalStatus: finalStatusDesc,
      absentStudents: absentStudents.map((uc) => uc.userId),
      class: updated,
    };
  });
};
