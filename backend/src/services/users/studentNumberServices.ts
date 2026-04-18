import { z } from "zod";
import { prisma } from "../../config/db";
import { AppError } from "../../utils/appError";

const userIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const studentNumberSchema = z.object({
  studentNumber: z.string().trim().min(1),
});

export const upsertStudentNumberService = async (params: unknown, body: unknown) => {
  const { id } = userIdSchema.parse(params);
  const { studentNumber } = studentNumberSchema.parse(body);

  const existingUser = await prisma.user.findUnique({
    where: { userId: id },
  });

  if (!existingUser) {
    throw new AppError("Utilizador não encontrado.", 404);
  }

  const existingNumber = await prisma.studentNumber.findUnique({
    where: { studentNumber },
  });

  if (existingNumber && existingNumber.userId !== id) {
    throw new AppError("Este número de aluno já está associado a outro utilizador.", 409);
  }

  return prisma.studentNumber.upsert({
    where: { userId: id },
    update: { studentNumber },
    create: { userId: id, studentNumber },
  });
};

export const deleteStudentNumberService = async (params: unknown) => {
  const { id } = userIdSchema.parse(params);

  await prisma.studentNumber.delete({
    where: { userId: id },
  }).catch(() => {
    throw new AppError("Número de aluno não encontrado.", 404);
  });

  return { message: "Número de aluno apagado com sucesso." };
};
