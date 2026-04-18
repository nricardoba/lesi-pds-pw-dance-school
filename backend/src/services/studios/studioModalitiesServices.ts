import { z } from 'zod';
import { prisma } from '../../config/db';
import { AppError } from '../../utils/appError';

const idSchema = z.object({ id: z.coerce.number().int().positive() });
const createStudioModalitySchema = z.object({
  studioId: z.coerce.number().int().positive(),
  modalityId: z.coerce.number().int().positive(),
});
const updateStudioModalitySchema = z.object({
  studioId: z.coerce.number().int().positive().optional(),
  modalityId: z.coerce.number().int().positive().optional(),
});

export const listStudioModalitiesService = async () => {
  return prisma.studioModality.findMany({
    include: { studio: true, modality: true },
    orderBy: { studioModalityId: 'asc' },
  });
};

export const createStudioModalityService = async (body: unknown) => {
  const { studioId, modalityId } = createStudioModalitySchema.parse(body);
  return prisma.studioModality.create({
    data: { studioId: Number(studioId), modalityId: Number(modalityId) },
  });
};

export const updateStudioModalityService = async (params: unknown, body: unknown) => {
  const { id } = idSchema.parse(params);
  const { studioId, modalityId } = updateStudioModalitySchema.parse(body);
  const existingStudioModality = await prisma.studioModality.findUnique({
    where: { studioModalityId: id }, select: { studioModalityId: true },
  });
  if (!existingStudioModality) throw new AppError("Rela��o est�dio-modalidade n�o encontrada.", 404);
  return prisma.studioModality.update({
    where: { studioModalityId: id },
    data: {
      ...(studioId !== undefined ? { studioId: Number(studioId) } : {}),
      ...(modalityId !== undefined ? { modalityId: Number(modalityId) } : {}),
    },
  });
};

export const deleteStudioModalityService = async (params: unknown) => {
  const { id } = idSchema.parse(params);
  const existingStudioModality = await prisma.studioModality.findUnique({
    where: { studioModalityId: id }, select: { studioModalityId: true },
  });
  if (!existingStudioModality) throw new AppError("Rela��o est�dio-modalidade n�o encontrada.", 404);
  await prisma.studioModality.delete({ where: { studioModalityId: id } });
  return null;
};
