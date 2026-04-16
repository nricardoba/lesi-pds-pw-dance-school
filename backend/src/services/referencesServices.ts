import { z } from 'zod';
import { prisma } from '../config/db';
import { AppError } from '../utils/appError';

const idSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const createSchoolYearSchema = z.object({
  school_year_name: z.string().min(1),
  school_year_start: z.string().min(1),
  school_year_end: z.string().min(1),
});

const createClassStatusSchema = z.object({
  class_status_desc: z.string().min(1),
});

const createModalitySchema = z.object({
  modality_name: z.string().min(1),
  modality_hourly_fee: z.coerce.number(),
});

const createStudioSchema = z.object({
  studio_name: z.string().min(1),
  studio_max_capacity: z.coerce.number().int(),
});

const createStudioModalitySchema = z.object({
  studio_id: z.coerce.number().int().positive(),
  modality_id: z.coerce.number().int().positive(),
});

const createUserClassRoleSchema = z.object({
  user_class_role_desc: z.string().min(1),
});

const updateSchoolYearSchema = z.object({
  school_year_name: z.string().min(1).optional(),
  school_year_start: z.string().min(1).optional(),
  school_year_end: z.string().min(1).optional(),
});

const updateClassStatusSchema = z.object({
  class_status_desc: z.string().min(1),
});

const updateModalitySchema = z.object({
  modality_name: z.string().min(1).optional(),
  modality_hourly_fee: z.coerce.number().optional(),
});

const updateStudioSchema = z.object({
  studio_name: z.string().min(1).optional(),
  studio_max_capacity: z.coerce.number().int().optional(),
});

const updateStudioModalitySchema = z.object({
  studio_id: z.coerce.number().int().positive().optional(),
  modality_id: z.coerce.number().int().positive().optional(),
});

const updateUserClassRoleSchema = z.object({
  user_class_role_desc: z.string().min(1),
});

export const listUserTypesService = async () => {
  return prisma.userType.findMany({
    orderBy: { userTypeId: 'asc' },
  });
};

export const listClassStatusesService = async () => {
  return prisma.classStatus.findMany({
    orderBy: { classStatusId: 'asc' },
  });
};

export const listUserClassRolesService = async () => {
  return prisma.userClassRole.findMany({
    orderBy: { userClassRoleId: 'asc' },
  });
};

export const listModalitiesService = async () => {
  return prisma.modality.findMany({
    orderBy: { modalityId: 'asc' },
  });
};

export const listStudiosService = async () => {
  return prisma.studio.findMany({
    orderBy: { studioId: 'asc' },
  });
};

export const listSchoolYearsService = async () => {
  return prisma.schoolYear.findMany({
    orderBy: { schoolYearId: 'asc' },
  });
};

export const listStudioModalitiesService = async () => {
  return prisma.studioModality.findMany({
    include: {
      studio: true,
      modality: true,
    },
    orderBy: { studioModalityId: 'asc' },
  });
};

export const createSchoolYearService = async (body: unknown) => {
  const { school_year_name, school_year_start, school_year_end } =
    createSchoolYearSchema.parse(body);

  const last = await prisma.schoolYear.findFirst({
    orderBy: { schoolYearId: 'desc' },
  });

  return prisma.schoolYear.create({
    data: {
      schoolYearId: (last?.schoolYearId ?? 0) + 1,
      schoolYearName: school_year_name,
      schoolYearStart: new Date(school_year_start),
      schoolYearEnd: new Date(school_year_end),
    },
  });
};

export const createClassStatusService = async (body: unknown) => {
  const { class_status_desc } = createClassStatusSchema.parse(body);

  const last = await prisma.classStatus.findFirst({
    orderBy: { classStatusId: 'desc' },
  });

  return prisma.classStatus.create({
    data: {
      classStatusId: (last?.classStatusId ?? 0) + 1,
      classStatusDesc: class_status_desc,
    },
  });
};

export const createModalityService = async (body: unknown) => {
  const { modality_name, modality_hourly_fee } = createModalitySchema.parse(body);

  const last = await prisma.modality.findFirst({
    orderBy: { modalityId: 'desc' },
  });

  return prisma.modality.create({
    data: {
      modalityId: (last?.modalityId ?? 0) + 1,
      modalityName: modality_name,
      modalityHourlyFee: Number(modality_hourly_fee),
    },
  });
};

export const createStudioService = async (body: unknown) => {
  const { studio_name, studio_max_capacity } = createStudioSchema.parse(body);

  const last = await prisma.studio.findFirst({
    orderBy: { studioId: 'desc' },
  });

  return prisma.studio.create({
    data: {
      studioId: (last?.studioId ?? 0) + 1,
      studioName: studio_name,
      studioMaxCapacity: Number(studio_max_capacity),
    },
  });
};

export const createStudioModalityService = async (body: unknown) => {
  const { studio_id, modality_id } = createStudioModalitySchema.parse(body);

  const last = await prisma.studioModality.findFirst({
    orderBy: { studioModalityId: 'desc' },
  });

  return prisma.studioModality.create({
    data: {
      studioModalityId: (last?.studioModalityId ?? 0) + 1,
      studioId: Number(studio_id),
      modalityId: Number(modality_id),
    },
  });
};

export const createUserClassRoleService = async (body: unknown) => {
  const { user_class_role_desc } = createUserClassRoleSchema.parse(body);

  const last = await prisma.userClassRole.findFirst({
    orderBy: { userClassRoleId: 'desc' },
  });

  return prisma.userClassRole.create({
    data: {
      userClassRoleId: (last?.userClassRoleId ?? 0) + 1,
      userClassRoleDesc: user_class_role_desc,
    },
  });
};

export const updateSchoolYearService = async (params: unknown, body: unknown) => {
  const { id } = idSchema.parse(params);
  const { school_year_name, school_year_start, school_year_end } =
    updateSchoolYearSchema.parse(body);

  const existingSchoolYear = await prisma.schoolYear.findUnique({
    where: { schoolYearId: id },
    select: { schoolYearId: true },
  });

  if (!existingSchoolYear) {
    throw new AppError('Ano letivo não encontrado.', 404);
  }

  return prisma.schoolYear.update({
    where: { schoolYearId: id },
    data: {
      ...(school_year_name !== undefined ? { schoolYearName: school_year_name } : {}),
      ...(school_year_start !== undefined
        ? { schoolYearStart: new Date(school_year_start) }
        : {}),
      ...(school_year_end !== undefined
        ? { schoolYearEnd: new Date(school_year_end) }
        : {}),
    },
  });
};

export const updateClassStatusService = async (params: unknown, body: unknown) => {
  const { id } = idSchema.parse(params);
  const { class_status_desc } = updateClassStatusSchema.parse(body);

  const existingClassStatus = await prisma.classStatus.findUnique({
    where: { classStatusId: id },
    select: { classStatusId: true },
  });

  if (!existingClassStatus) {
    throw new AppError('Estado da aula não encontrado.', 404);
  }

  return prisma.classStatus.update({
    where: { classStatusId: id },
    data: { classStatusDesc: class_status_desc },
  });
};

export const updateModalityService = async (params: unknown, body: unknown) => {
  const { id } = idSchema.parse(params);
  const { modality_name, modality_hourly_fee } = updateModalitySchema.parse(body);

  const existingModality = await prisma.modality.findUnique({
    where: { modalityId: id },
    select: { modalityId: true },
  });

  if (!existingModality) {
    throw new AppError('Modalidade não encontrada.', 404);
  }

  return prisma.modality.update({
    where: { modalityId: id },
    data: {
      ...(modality_name !== undefined ? { modalityName: modality_name } : {}),
      ...(modality_hourly_fee !== undefined
        ? { modalityHourlyFee: Number(modality_hourly_fee) }
        : {}),
    },
  });
};

export const updateStudioService = async (params: unknown, body: unknown) => {
  const { id } = idSchema.parse(params);
  const { studio_name, studio_max_capacity } = updateStudioSchema.parse(body);

  const existingStudio = await prisma.studio.findUnique({
    where: { studioId: id },
    select: { studioId: true },
  });

  if (!existingStudio) {
    throw new AppError('Estúdio não encontrado.', 404);
  }

  return prisma.studio.update({
    where: { studioId: id },
    data: {
      ...(studio_name !== undefined ? { studioName: studio_name } : {}),
      ...(studio_max_capacity !== undefined
        ? { studioMaxCapacity: Number(studio_max_capacity) }
        : {}),
    },
  });
};

export const updateStudioModalityService = async (
  params: unknown,
  body: unknown
) => {
  const { id } = idSchema.parse(params);
  const { studio_id, modality_id } = updateStudioModalitySchema.parse(body);

  const existingStudioModality = await prisma.studioModality.findUnique({
    where: { studioModalityId: id },
    select: { studioModalityId: true },
  });

  if (!existingStudioModality) {
    throw new AppError('Relação estúdio-modalidade não encontrada.', 404);
  }

  return prisma.studioModality.update({
    where: { studioModalityId: id },
    data: {
      ...(studio_id !== undefined ? { studioId: Number(studio_id) } : {}),
      ...(modality_id !== undefined ? { modalityId: Number(modality_id) } : {}),
    },
  });
};

export const updateUserClassRoleService = async (
  params: unknown,
  body: unknown
) => {
  const { id } = idSchema.parse(params);
  const { user_class_role_desc } = updateUserClassRoleSchema.parse(body);

  const existingUserClassRole = await prisma.userClassRole.findUnique({
    where: { userClassRoleId: id },
    select: { userClassRoleId: true },
  });

  if (!existingUserClassRole) {
    throw new AppError('Papel de aula não encontrado.', 404);
  }

  return prisma.userClassRole.update({
    where: { userClassRoleId: id },
    data: { userClassRoleDesc: user_class_role_desc },
  });
};

export const deleteUserClassRoleService = async (params: unknown) => {
  const { id } = idSchema.parse(params);

  const existingUserClassRole = await prisma.userClassRole.findUnique({
    where: { userClassRoleId: id },
    select: { userClassRoleId: true },
  });

  if (!existingUserClassRole) {
    throw new AppError('Papel de aula não encontrado.', 404);
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
    throw new AppError('Ano letivo não encontrado.', 404);
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
    throw new AppError('Estado da aula não encontrado.', 404);
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
    throw new AppError('Modalidade não encontrada.', 404);
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
    throw new AppError('Estúdio não encontrado.', 404);
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
    throw new AppError('Relação estúdio-modalidade não encontrada.', 404);
  }

  await prisma.studioModality.delete({
    where: { studioModalityId: id },
  });

  return null;
};
