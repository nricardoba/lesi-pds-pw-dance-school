import { z } from 'zod';
import { prisma } from '../config/db';
import { AppError } from '../utils/appError';

const classIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const classUserParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
  userId: z.coerce.number().int().positive(),
});

const createClassSchema = z.object({
  school_year_id: z.coerce.number().int().positive(),
  class_date_start: z.string().min(1),
  class_date_end: z.string().min(1),
  class_recurrence: z.boolean().optional().nullable(),
  studio_modality_id: z.coerce.number().int().positive(),
  class_final_fee: z.coerce.number().nonnegative(),
  class_status_id: z.coerce.number().int().positive(),
});

const createUserClassSchema = z.object({
  user_id: z.coerce.number().int().positive(),
  user_class_role_id: z.coerce.number().int().positive().optional().nullable(),
  user_validation: z.boolean().optional(),
});

const updateClassSchema = z.object({
  school_year_id: z.coerce.number().int().positive().optional(),
  class_date_start: z.string().min(1).optional(),
  class_date_end: z.string().min(1).optional(),
  class_recurrence: z.boolean().optional().nullable(),
  studio_modality_id: z.coerce.number().int().positive().optional(),
  class_final_fee: z.coerce.number().nonnegative().optional(),
  class_status_id: z.coerce.number().int().positive().optional(),
});

const updateUserClassSchema = z.object({
  user_class_role_id: z.coerce.number().int().positive().optional().nullable(),
  user_validation: z.boolean().optional(),
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
      classId: 'asc',
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
    throw new AppError('Aula não encontrada.', 404);
  }

  return classItem;
};

export const createClassService = async (body: unknown) => {
  const {
    school_year_id,
    class_date_start,
    class_date_end,
    class_recurrence,
    studio_modality_id,
    class_final_fee,
    class_status_id,
  } = createClassSchema.parse(body);

  return prisma.class.create({
    data: {
      schoolYearId: school_year_id,
      classDateStart: new Date(`1970-01-01T${class_date_start}`),
      classDateEnd: new Date(`1970-01-01T${class_date_end}`),
      classRecurrence: class_recurrence ?? false,
      studioModalityId: studio_modality_id,
      classFinalFee: class_final_fee,
      classStatusId: class_status_id,
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
  const { user_id, user_class_role_id, user_validation } =
    createUserClassSchema.parse(body);

  const existingClass = await prisma.class.findUnique({
    where: { classId: id },
    select: { classId: true },
  });

  if (!existingClass) {
    throw new AppError('Aula não encontrada.', 404);
  }

  const existingUser = await prisma.user.findUnique({
    where: { userId: user_id },
    select: { userId: true },
  });

  if (!existingUser) {
    throw new AppError('Utilizador não encontrado.', 404);
  }

  return prisma.userClass.create({
    data: {
      classId: id,
      userId: user_id,
      userClassRoleId: user_class_role_id ?? null,
      userValidation: user_validation ?? false,
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
    select: { classId: true },
  });

  if (!existingClass) {
    throw new AppError('Aula não encontrada.', 404);
  }

  const dataToUpdate: Record<string, unknown> = {};

  if (parsedBody.school_year_id !== undefined) {
    dataToUpdate.schoolYearId = parsedBody.school_year_id;
  }

  if (parsedBody.class_date_start !== undefined) {
    dataToUpdate.classDateStart = new Date(
      `1970-01-01T${parsedBody.class_date_start}`
    );
  }

  if (parsedBody.class_date_end !== undefined) {
    dataToUpdate.classDateEnd = new Date(
      `1970-01-01T${parsedBody.class_date_end}`
    );
  }

  if (parsedBody.class_recurrence !== undefined) {
    dataToUpdate.classRecurrence = parsedBody.class_recurrence;
  }

  if (parsedBody.studio_modality_id !== undefined) {
    dataToUpdate.studioModalityId = parsedBody.studio_modality_id;
  }

  if (parsedBody.class_final_fee !== undefined) {
    dataToUpdate.classFinalFee = parsedBody.class_final_fee;
  }

  if (parsedBody.class_status_id !== undefined) {
    dataToUpdate.classStatusId = parsedBody.class_status_id;
  }

  return prisma.class.update({
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
    },
  });
};

export const deleteClassService = async (params: unknown) => {
  const { id } = classIdSchema.parse(params);

  const existingClass = await prisma.class.findUnique({
    where: { classId: id },
    select: { classId: true },
  });

  if (!existingClass) {
    throw new AppError('Aula não encontrada.', 404);
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
      ...(parsedBody.user_class_role_id !== undefined
        ? { userClassRoleId: parsedBody.user_class_role_id }
        : {}),
      ...(parsedBody.user_validation !== undefined
        ? { userValidation: parsedBody.user_validation }
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