import { z } from "zod";
import { prisma } from "../config/db";
import { AppError } from "../utils/appError";

const idSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const createSchoolYearSchema = z.object({
  schoolYearName: z.string().min(1),
  schoolYearStart: z.string().min(1),
  schoolYearEnd: z.string().min(1),
});

const createClassStatusSchema = z.object({
  classStatusDesc: z.string().min(1),
});

const createModalitySchema = z.object({
  modalityName: z.string().min(1),
  modalityHourlyFee: z.coerce.number(),
});

const createStudioSchema = z.object({
  studioName: z.string().min(1),
  studioMaxCapacity: z.coerce.number().int(),
});

const createStudioModalitySchema = z.object({
  studioId: z.coerce.number().int().positive(),
  modalityId: z.coerce.number().int().positive(),
});

const createUserClassRoleSchema = z.object({
  userClassRoleDesc: z.string().min(1),
});

const updateSchoolYearSchema = z.object({
  schoolYearName: z.string().min(1).optional(),
  schoolYearStart: z.string().min(1).optional(),
  schoolYearEnd: z.string().min(1).optional(),
});

const updateClassStatusSchema = z.object({
  classStatusDesc: z.string().min(1),
});

const updateModalitySchema = z.object({
  modalityName: z.string().min(1).optional(),
  modalityHourlyFee: z.coerce.number().optional(),
});

const updateStudioSchema = z.object({
  studioName: z.string().min(1).optional(),
  studioMaxCapacity: z.coerce.number().int().optional(),
});

const updateStudioModalitySchema = z.object({
  studioId: z.coerce.number().int().positive().optional(),
  modalityId: z.coerce.number().int().positive().optional(),
});

const updateUserClassRoleSchema = z.object({
  userClassRoleDesc: z.string().min(1),
});

export const listUserTypesService = async () => {
  return prisma.userType.findMany({
    orderBy: { userTypeId: "asc" },
  });
};

export const listClassStatusesService = async () => {
  return prisma.classStatus.findMany({
    orderBy: { classStatusId: "asc" },
  });
};

export const listUserClassRolesService = async () => {
  return prisma.userClassRole.findMany({
    orderBy: { userClassRoleId: "asc" },
  });
};

export const listModalitiesService = async () => {
  return prisma.modality.findMany({
    orderBy: { modalityId: "asc" },
  });
};

export const listStudiosService = async () => {
  return prisma.studio.findMany({
    orderBy: { studioId: "asc" },
  });
};

export const listSchoolYearsService = async () => {
  return prisma.schoolYear.findMany({
    orderBy: { schoolYearId: "asc" },
  });
};

export const listStudioModalitiesService = async () => {
  return prisma.studioModality.findMany({
    include: {
      studio: true,
      modality: true,
    },
    orderBy: { studioModalityId: "asc" },
  });
};

export const createSchoolYearService = async (body: unknown) => {
  const { schoolYearName, schoolYearStart, schoolYearEnd } =
    createSchoolYearSchema.parse(body);

  return prisma.schoolYear.create({
    data: {
      schoolYearName,
      schoolYearStart: new Date(schoolYearStart),
      schoolYearEnd: new Date(schoolYearEnd),
    },
  });
};

export const createClassStatusService = async (body: unknown) => {
  const { classStatusDesc } = createClassStatusSchema.parse(body);

  return prisma.classStatus.create({
    data: {
      classStatusDesc,
    },
  });
};

export const createModalityService = async (body: unknown) => {
  const { modalityName, modalityHourlyFee } = createModalitySchema.parse(body);

  return prisma.modality.create({
    data: {
      modalityName,
      modalityHourlyFee: Number(modalityHourlyFee),
    },
  });
};

export const createStudioService = async (body: unknown) => {
  const { studioName, studioMaxCapacity } = createStudioSchema.parse(body);

  return prisma.studio.create({
    data: {
      studioName,
      studioMaxCapacity: Number(studioMaxCapacity),
    },
  });
};

export const createStudioModalityService = async (body: unknown) => {
  const { studioId, modalityId } = createStudioModalitySchema.parse(body);

  return prisma.studioModality.create({
    data: {
      studioId: Number(studioId),
      modalityId: Number(modalityId),
    },
  });
};

export const createUserClassRoleService = async (body: unknown) => {
  const { userClassRoleDesc } = createUserClassRoleSchema.parse(body);

  return prisma.userClassRole.create({
    data: {
      userClassRoleDesc,
    },
  });
};

export const updateSchoolYearService = async (params: unknown, body: unknown) => {
  const { id } = idSchema.parse(params);
  const { schoolYearName, schoolYearStart, schoolYearEnd } =
    updateSchoolYearSchema.parse(body);

  const existingSchoolYear = await prisma.schoolYear.findUnique({
    where: { schoolYearId: id },
    select: { schoolYearId: true },
  });

  if (!existingSchoolYear) {
    throw new AppError("Ano letivo não encontrado.", 404);
  }

  return prisma.schoolYear.update({
    where: { schoolYearId: id },
    data: {
      ...(schoolYearName !== undefined ? { schoolYearName } : {}),
      ...(schoolYearStart !== undefined
        ? { schoolYearStart: new Date(schoolYearStart) }
        : {}),
      ...(schoolYearEnd !== undefined
        ? { schoolYearEnd: new Date(schoolYearEnd) }
        : {}),
    },
  });
};

export const updateClassStatusService = async (params: unknown, body: unknown) => {
  const { id } = idSchema.parse(params);
  const { classStatusDesc } = updateClassStatusSchema.parse(body);

  const existingClassStatus = await prisma.classStatus.findUnique({
    where: { classStatusId: id },
    select: { classStatusId: true },
  });

  if (!existingClassStatus) {
    throw new AppError("Estado da aula não encontrado.", 404);
  }

  return prisma.classStatus.update({
    where: { classStatusId: id },
    data: { classStatusDesc },
  });
};

export const updateModalityService = async (params: unknown, body: unknown) => {
  const { id } = idSchema.parse(params);
  const { modalityName, modalityHourlyFee } = updateModalitySchema.parse(body);

  const existingModality = await prisma.modality.findUnique({
    where: { modalityId: id },
    select: { modalityId: true },
  });

  if (!existingModality) {
    throw new AppError("Modalidade não encontrada.", 404);
  }

  return prisma.modality.update({
    where: { modalityId: id },
    data: {
      ...(modalityName !== undefined ? { modalityName } : {}),
      ...(modalityHourlyFee !== undefined
        ? { modalityHourlyFee: Number(modalityHourlyFee) }
        : {}),
    },
  });
};

export const updateStudioService = async (params: unknown, body: unknown) => {
  const { id } = idSchema.parse(params);
  const { studioName, studioMaxCapacity } = updateStudioSchema.parse(body);

  const existingStudio = await prisma.studio.findUnique({
    where: { studioId: id },
    select: { studioId: true },
  });

  if (!existingStudio) {
    throw new AppError("Estúdio não encontrado.", 404);
  }

  return prisma.studio.update({
    where: { studioId: id },
    data: {
      ...(studioName !== undefined ? { studioName } : {}),
      ...(studioMaxCapacity !== undefined
        ? { studioMaxCapacity: Number(studioMaxCapacity) }
        : {}),
    },
  });
};

export const updateStudioModalityService = async (
  params: unknown,
  body: unknown
) => {
  const { id } = idSchema.parse(params);
  const { studioId, modalityId } = updateStudioModalitySchema.parse(body);

  const existingStudioModality = await prisma.studioModality.findUnique({
    where: { studioModalityId: id },
    select: { studioModalityId: true },
  });

  if (!existingStudioModality) {
    throw new AppError("Relação estúdio-modalidade não encontrada.", 404);
  }

  return prisma.studioModality.update({
    where: { studioModalityId: id },
    data: {
      ...(studioId !== undefined ? { studioId: Number(studioId) } : {}),
      ...(modalityId !== undefined ? { modalityId: Number(modalityId) } : {}),
    },
  });
};

export const updateUserClassRoleService = async (
  params: unknown,
  body: unknown
) => {
  const { id } = idSchema.parse(params);
  const { userClassRoleDesc } = updateUserClassRoleSchema.parse(body);

  const existingUserClassRole = await prisma.userClassRole.findUnique({
    where: { userClassRoleId: id },
    select: { userClassRoleId: true },
  });

  if (!existingUserClassRole) {
    throw new AppError("Papel de aula não encontrado.", 404);
  }

  return prisma.userClassRole.update({
    where: { userClassRoleId: id },
    data: { userClassRoleDesc },
  });
};

export const deleteUserClassRoleService = async (params: unknown) => {
  const { id } = idSchema.parse(params);

  const existingUserClassRole = await prisma.userClassRole.findUnique({
    where: { userClassRoleId: id },
    select: { userClassRoleId: true },
  });

  if (!existingUserClassRole) {
    throw new AppError("Papel de aula não encontrado.", 404);
  }

  await prisma.userClassRole.delete({
    where: { userClassRoleId: id },
  });

  return null;
};

export const deleteSchoolYearService = async (params: unknown) => {
  const { id } = idSchema.parse(params);

  const existingSchoolYear = await prisma.schoolYear.findUnique({
    where: { schoolYearId: id },
    select: { schoolYearId: true },
  });

  if (!existingSchoolYear) {
    throw new AppError("Ano letivo não encontrado.", 404);
  }

  await prisma.schoolYear.delete({
    where: { schoolYearId: id },
  });

  return null;
};

export const deleteClassStatusService = async (params: unknown) => {
  const { id } = idSchema.parse(params);

  const existingClassStatus = await prisma.classStatus.findUnique({
    where: { classStatusId: id },
    select: { classStatusId: true },
  });

  if (!existingClassStatus) {
    throw new AppError("Estado da aula não encontrado.", 404);
  }

  await prisma.classStatus.delete({
    where: { classStatusId: id },
  });

  return null;
};

export const deleteModalityService = async (params: unknown) => {
  const { id } = idSchema.parse(params);

  const existingModality = await prisma.modality.findUnique({
    where: { modalityId: id },
    select: { modalityId: true },
  });

  if (!existingModality) {
    throw new AppError("Modalidade não encontrada.", 404);
  }

  await prisma.modality.delete({
    where: { modalityId: id },
  });

  return null;
};

export const deleteStudioService = async (params: unknown) => {
  const { id } = idSchema.parse(params);

  const existingStudio = await prisma.studio.findUnique({
    where: { studioId: id },
    select: { studioId: true },
  });

  if (!existingStudio) {
    throw new AppError("Estúdio não encontrado.", 404);
  }

  await prisma.studio.delete({
    where: { studioId: id },
  });

  return null;
};

export const deleteStudioModalityService = async (params: unknown) => {
  const { id } = idSchema.parse(params);

  const existingStudioModality = await prisma.studioModality.findUnique({
    where: { studioModalityId: id },
    select: { studioModalityId: true },
  });

  if (!existingStudioModality) {
    throw new AppError("Relação estúdio-modalidade não encontrada.", 404);
  }

  await prisma.studioModality.delete({
    where: { studioModalityId: id },
  });

  return null;
};
