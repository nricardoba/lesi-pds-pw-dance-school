import { z } from 'zod';
import { prisma } from '../../config/db';
import { AppError } from '../../utils/appError';

const idSchema = z.object({ id: z.coerce.number().int().positive() });
const createUserClassRoleSchema = z.object({
  userClassRoleDesc: z.string().min(1),
});
const updateUserClassRoleSchema = z.object({
  userClassRoleDesc: z.string().min(1).optional(),
});

export const listUserClassRolesService = async () => {
  return prisma.userClassRole.findMany({ orderBy: { userClassRoleId: 'asc' } });
};

export const createUserClassRoleService = async (body: unknown) => {
  const { userClassRoleDesc } = createUserClassRoleSchema.parse(body);
  return prisma.userClassRole.create({
    data: { userClassRoleDesc },
  });
};

export const updateUserClassRoleService = async (params: unknown, body: unknown) => {
  const { id } = idSchema.parse(params);
  const { userClassRoleDesc } = updateUserClassRoleSchema.parse(body);
  const existingRole = await prisma.userClassRole.findUnique({
    where: { userClassRoleId: id }, select: { userClassRoleId: true },
  });
  if (!existingRole) throw new AppError("Papel de utilizador na aula não encontrado.", 404);
  return prisma.userClassRole.update({
    where: { userClassRoleId: id },
    data: {
      ...(userClassRoleDesc !== undefined ? { userClassRoleDesc } : {}),
    },
  });
};

export const deleteUserClassRoleService = async (params: unknown) => {
  const { id } = idSchema.parse(params);
  const existingRole = await prisma.userClassRole.findUnique({
    where: { userClassRoleId: id }, select: { userClassRoleId: true },
  });
  if (!existingRole) throw new AppError("Papel de utilizador na aula não encontrado.", 404);
  await prisma.userClassRole.delete({ where: { userClassRoleId: id } });
  return null;
};
