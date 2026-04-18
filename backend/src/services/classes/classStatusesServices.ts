import { z } from 'zod';
import { prisma } from '../../config/db';
import { AppError } from '../../utils/appError';

const idSchema = z.object({ id: z.coerce.number().int().positive() });
const createClassStatusSchema = z.object({ classStatusDesc: z.string().min(1) });
const updateClassStatusSchema = z.object({ classStatusDesc: z.string().min(1) });

export const listClassStatusesService = async () => {
  return prisma.classStatus.findMany({ orderBy: { classStatusId: 'asc' } });
};

export const createClassStatusService = async (body: unknown) => {
  const { classStatusDesc } = createClassStatusSchema.parse(body);
  return prisma.classStatus.create({ data: { classStatusDesc } });
};

export const updateClassStatusService = async (params: unknown, body: unknown) => {
  const { id } = idSchema.parse(params);
  const { classStatusDesc } = updateClassStatusSchema.parse(body);
  const existingClassStatus = await prisma.classStatus.findUnique({
    where: { classStatusId: id },
    select: { classStatusId: true },
  });
  if (!existingClassStatus) throw new AppError("Estado da aula n�o encontrado.", 404);
  return prisma.classStatus.update({
    where: { classStatusId: id },
    data: { classStatusDesc },
  });
};

export const deleteClassStatusService = async (params: unknown) => {
  const { id } = idSchema.parse(params);
  const existingClassStatus = await prisma.classStatus.findUnique({
    where: { classStatusId: id },
    select: { classStatusId: true },
  });
  if (!existingClassStatus) throw new AppError("Estado da aula n�o encontrado.", 404);
  await prisma.classStatus.delete({ where: { classStatusId: id } });
  return null;
};
