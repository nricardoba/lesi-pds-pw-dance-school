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

const parseDateInput = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new AppError('Data inválida.', 400);
  }

  return date;
};

const ensureSchoolYearDoesNotOverlap = async (
  schoolYearStart: Date,
  schoolYearEnd: Date,
  schoolYearIdToIgnore?: number,
) => {
  const overlappingSchoolYear = await prisma.schoolYear.findFirst({
    where: {
      ...(schoolYearIdToIgnore !== undefined ? { schoolYearId: { not: schoolYearIdToIgnore } } : {}),
      schoolYearStart: { lte: schoolYearEnd },
      schoolYearEnd: { gte: schoolYearStart },
    },
    select: {
      schoolYearName: true,
    },
  });

  if (overlappingSchoolYear) {
    throw new AppError(
      `O intervalo do ano letivo coincide com "${overlappingSchoolYear.schoolYearName}".`,
      400,
    );
  }
};

export const listSchoolYearsService = async () => {
  return prisma.schoolYear.findMany({ orderBy: { schoolYearId: 'asc' } });
};

export const createSchoolYearService = async (body: unknown) => {
  const { schoolYearName, schoolYearStart, schoolYearEnd } = createSchoolYearSchema.parse(body);
  const parsedSchoolYearStart = parseDateInput(schoolYearStart);
  const parsedSchoolYearEnd = parseDateInput(schoolYearEnd);

  if (parsedSchoolYearStart > parsedSchoolYearEnd) {
    throw new AppError('A data de início deve ser anterior à data de fim.', 400);
  }

  await ensureSchoolYearDoesNotOverlap(parsedSchoolYearStart, parsedSchoolYearEnd);

  return prisma.schoolYear.create({
    data: {
      schoolYearName,
      schoolYearStart: parsedSchoolYearStart,
      schoolYearEnd: parsedSchoolYearEnd,
    },
  });
};

export const updateSchoolYearService = async (params: unknown, body: unknown) => {
  const { id } = idSchema.parse(params);
  const { schoolYearName, schoolYearStart, schoolYearEnd } = updateSchoolYearSchema.parse(body);
  const existingSchoolYear = await prisma.schoolYear.findUnique({
    where: { schoolYearId: id },
    select: { schoolYearId: true, schoolYearName: true, schoolYearStart: true, schoolYearEnd: true },
  });
  if (!existingSchoolYear) throw new AppError("Ano letivo n�o encontrado.", 404);

  const parsedSchoolYearStart = schoolYearStart !== undefined ? parseDateInput(schoolYearStart) : existingSchoolYear.schoolYearStart;
  const parsedSchoolYearEnd = schoolYearEnd !== undefined ? parseDateInput(schoolYearEnd) : existingSchoolYear.schoolYearEnd;

  if (parsedSchoolYearStart > parsedSchoolYearEnd) {
    throw new AppError('A data de início deve ser anterior à data de fim.', 400);
  }

  await ensureSchoolYearDoesNotOverlap(parsedSchoolYearStart, parsedSchoolYearEnd, id);

  return prisma.schoolYear.update({
    where: { schoolYearId: id },
    data: {
      ...(schoolYearName !== undefined ? { schoolYearName } : {}),
      ...(schoolYearStart !== undefined ? { schoolYearStart: parsedSchoolYearStart } : {}),
      ...(schoolYearEnd !== undefined ? { schoolYearEnd: parsedSchoolYearEnd } : {}),
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
