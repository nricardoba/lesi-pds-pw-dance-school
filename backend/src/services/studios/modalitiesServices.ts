import { z } from 'zod';
import { prisma } from '../../config/db';
import { AppError } from '../../utils/appError';

const idSchema = z.object({ id: z.coerce.number().int().positive() });
const createModalitySchema = z.object({
  modalityName: z.string().min(1),
  modalityHourlyFee: z.coerce.number(),
});
const updateModalitySchema = z.object({
  modalityName: z.string().min(1).optional(),
  modalityHourlyFee: z.coerce.number().optional(),
});

export const listModalitiesService = async () => {
  return prisma.modality.findMany({ orderBy: { modalityId: 'asc' } });
};

export const getModalityByIdService = async (params: unknown) => {
  const { id } = idSchema.parse(params);
  const modality = await prisma.modality.findUnique({
    where: { modalityId: id },
  });
  if (!modality) {
    throw new AppError("Modalidade não encontrada.", 404);
  }
  return modality;
};

export const createModalityService = async (body: unknown) => {
  const { modalityName, modalityHourlyFee } = createModalitySchema.parse(body);
  return prisma.modality.create({
    data: { modalityName, modalityHourlyFee: Number(modalityHourlyFee) },
  });
};

export const updateModalityService = async (params: unknown, body: unknown) => {
  const { id } = idSchema.parse(params);
  const { modalityName, modalityHourlyFee } = updateModalitySchema.parse(body);
  const existingModality = await prisma.modality.findUnique({
    where: { modalityId: id }, select: { modalityId: true },
  });
  if (!existingModality) throw new AppError("Modalidade não encontrada.", 404);
  return prisma.modality.update({
    where: { modalityId: id },
    data: {
      ...(modalityName !== undefined ? { modalityName } : {}),
      ...(modalityHourlyFee !== undefined ? { modalityHourlyFee: Number(modalityHourlyFee) } : {}),
    },
  });
};

export const deleteModalityService = async (params: unknown) => {
  const { id } = idSchema.parse(params);
  const existingModality = await prisma.modality.findUnique({
    where: { modalityId: id }, select: { modalityId: true },
  });
  if (!existingModality) throw new AppError("Modalidade não encontrada.", 404);
  await prisma.modality.delete({ where: { modalityId: id } });
  return null;
};
