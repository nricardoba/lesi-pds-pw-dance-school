import { z } from 'zod';
import { prisma } from '../../config/db';
import { AppError } from '../../utils/appError';

const idSchema = z.object({ id: z.coerce.number().int().positive() });
const createStudioSchema = z.object({
  studioName: z.string().min(1),
  studioMaxCapacity: z.coerce.number().int(),
});
const updateStudioSchema = z.object({
  studioName: z.string().min(1).optional(),
  studioMaxCapacity: z.coerce.number().int().optional(),
});

export const getAvailableStudiosService = async (modalityId: number) => {
  if (!modalityId) throw new AppError("modalityId é obrigatório.", 400);

  return prisma.studioModality.findMany({
    where: { modalityId },
    include: { studio: true, modality: true },
  });
};

export const listStudiosService = async () => {
  return prisma.studio.findMany({ orderBy: { studioId: 'asc' } });
};

export const createStudioService = async (body: unknown) => {
  const { studioName, studioMaxCapacity } = createStudioSchema.parse(body);
  return prisma.studio.create({
    data: { studioName, studioMaxCapacity: Number(studioMaxCapacity) },
  });
};

export const updateStudioService = async (params: unknown, body: unknown) => {
  const { id } = idSchema.parse(params);
  const { studioName, studioMaxCapacity } = updateStudioSchema.parse(body);
  const existingStudio = await prisma.studio.findUnique({
    where: { studioId: id }, select: { studioId: true },
  });
  if (!existingStudio) throw new AppError("Estudio não encontrado.", 404);
  return prisma.studio.update({
    where: { studioId: id },
    data: {
      ...(studioName !== undefined ? { studioName } : {}),
      ...(studioMaxCapacity !== undefined ? { studioMaxCapacity: Number(studioMaxCapacity) } : {}),
    },
  });
};

export const deleteStudioService = async (params: unknown) => {
  const { id } = idSchema.parse(params);
  const existingStudio = await prisma.studio.findUnique({
    where: { studioId: id }, select: { studioId: true },
  });
  if (!existingStudio) throw new AppError("Estudio não encontrado.", 404);
  await prisma.studio.delete({ where: { studioId: id } });
  return null;
};
