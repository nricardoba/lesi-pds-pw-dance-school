import { z } from "zod";
import { prisma } from "../../config/db";
import { AppError } from "../../utils/appError";

const classIdSchema = z.object({
  id: z.coerce.number().int().positive(),
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
  studioModalityId: z.coerce.number().int().positive(),
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
  classFinalFee: z.coerce.number().nonnegative().optional(),
  classStatusId: z.coerce.number().int().positive().optional(),
});

const updateUserClassSchema = z.object({
  userClassRoleId: z.coerce.number().int().positive().optional().nullable(),
  userValidation: z.boolean().optional(),
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
  const {
    schoolYearId,
    classDateStart,
    classDateEnd,
    classRecurrence,
    studioModalityId,
    classFinalFee,
    classStatusId,
  } = createClassSchema.parse(body);

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
    userValidation: userValidation ?? null,
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
    throw new AppError("Aula não encontrada.", 404);
  }

  const dataToUpdate: Record<string, unknown> = {};

  if (parsedBody.schoolYearId !== undefined) {
    dataToUpdate.schoolYearId = parsedBody.schoolYearId;
  }

  if (parsedBody.classDateStart !== undefined) {
    dataToUpdate.classDateStart = new Date(
      parsedBody.classDateStart
    );
  }

  if (parsedBody.classDateEnd !== undefined) {
    dataToUpdate.classDateEnd = new Date(
      parsedBody.classDateEnd
    );
  }

  if (parsedBody.classRecurrence !== undefined) {
    dataToUpdate.classRecurrence = parsedBody.classRecurrence;
  }

  if (parsedBody.studioModalityId !== undefined) {
    dataToUpdate.studioModalityId = parsedBody.studioModalityId;
  }

  if (parsedBody.classFinalFee !== undefined) {
    dataToUpdate.classFinalFee = parsedBody.classFinalFee;
  }

  if (parsedBody.classStatusId !== undefined) {
    dataToUpdate.classStatusId = parsedBody.classStatusId;
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