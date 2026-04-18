import { z } from 'zod';
import { prisma } from '../../config/db';
import { AppError } from '../../utils/appError';

const idSchema = z.object({ id: z.coerce.number().int().positive() });
const createSchoolYearSchema = z.object({
  schoolYearName: z.string().min(1),
  schoolYearStart: z.string().min(1),
  schoolYearEnd: z.string().min(1),
});
const updateSchoolYearSchema = z.object({
  schoolYearName: z.string().min(1).optional(),
  schoolYearStart: z.string().min(1).optional(),
  schoolYearEnd: z.string().min(1).optional(),
});

export const listSchoolYearsService = async () => {
  return prisma.schoolYear.findMany({ orderBy: { schoolYearId: 'asc' } });
};

export const createSchoolYearService = async (body: unknown) => {
  const { schoolYearName, schoolYearStart, schoolYearEnd } = createSchoolYearSchema.parse(body);
  return prisma.schoolYear.create({
    data: {
      schoolYearName,
      schoolYearStart: new Date(schoolYearStart),
      schoolYearEnd: new Date(schoolYearEnd),
    },
  });
};

export const updateSchoolYearService = async (params: unknown, body: unknown) => {
  const { id } = idSchema.parse(params);
  const { schoolYearName, schoolYearStart, schoolYearEnd } = updateSchoolYearSchema.parse(body);
  const existingSchoolYear = await prisma.schoolYear.findUnique({
    where: { schoolYearId: id }, select: { schoolYearId: true },
  });
  if (!existingSchoolYear) throw new AppError("Ano letivo n�o encontrado.", 404);
  return prisma.schoolYear.update({
    where: { schoolYearId: id },
    data: {
      ...(schoolYearName !== undefined ? { schoolYearName } : {}),
      ...(schoolYearStart !== undefined ? { schoolYearStart: new Date(schoolYearStart) } : {}),
      ...(schoolYearEnd !== undefined ? { schoolYearEnd: new Date(schoolYearEnd) } : {}),
    },
  });
};

export const deleteSchoolYearService = async (params: unknown) => {
  const { id } = idSchema.parse(params);
  const existingSchoolYear = await prisma.schoolYear.findUnique({
    where: { schoolYearId: id }, select: { schoolYearId: true },
  });
  if (!existingSchoolYear) throw new AppError("Ano letivo n�o encontrado.", 404);
  await prisma.schoolYear.delete({ where: { schoolYearId: id } });
  return null;
};
