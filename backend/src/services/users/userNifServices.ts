import { z } from "zod";
import { prisma } from "../../config/db";
import { AppError } from "../../utils/appError";

const userIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const userNifSchema = z.object({
  userNif: z.string().trim().min(9).max(9),
});

export const upsertUserNifService = async (params: unknown, body: unknown) => {
  const { id } = userIdSchema.parse(params);
  const { userNif } = userNifSchema.parse(body);

  const existingUser = await prisma.user.findUnique({
    where: { userId: id },
  });

  if (!existingUser) {
    throw new AppError("Utilizador não encontrado.", 404);
  }

  // Verifica se outro user já tem este NIF
  const existingNif = await prisma.userNIF.findUnique({
    where: { userNif },
  });

  if (existingNif && existingNif.userId !== id) {
    throw new AppError("Este NIF já está associado a outro utilizador.", 409);
  }

  return prisma.userNIF.upsert({
    where: { userId: id },
    update: { userNif },
    create: { userId: id, userNif },
  });
};

export const deleteUserNifService = async (params: unknown) => {
  const { id } = userIdSchema.parse(params);

  await prisma.userNIF.delete({
    where: { userId: id },
  }).catch(() => {
    throw new AppError("Registo de NIF não encontrado.", 404);
  });

  return { message: "NIF apagado com sucesso." };
};
