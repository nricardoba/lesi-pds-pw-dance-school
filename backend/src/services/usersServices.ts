import { z } from 'zod';
import { prisma } from '../config/db';
import { AppError } from '../utils/appError';

const userIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const createUserSchema = z.object({
  user_name: z.string().min(1),
  user_birth_date: z.string().optional().nullable(),
  user_start_date: z.string().optional().nullable(),
  user_type_id: z.coerce.number().int().positive(),
  user_is_active: z.coerce.boolean(),
  student_number: z.string().optional(),
  user_nif: z.string().optional(),
});

const updateUserSchema = z.object({
  user_name: z.string().min(1).optional(),
  user_birth_date: z.string().optional().nullable(),
  user_start_date: z.string().optional().nullable(),
  user_type_id: z.coerce.number().int().positive().optional(),
  user_is_active: z.coerce.boolean().optional(),
});

export const listUsersService = async () => {
  return prisma.user.findMany({
    include: {
      userType: true,
      studentNumber: true,
    },
    orderBy: {
      userId: 'asc',
    },
  });
};

export const getUserByIdService = async (params: unknown) => {
  const { id } = userIdSchema.parse(params);

  const user = await prisma.user.findUnique({
    where: { userId: id },
    include: {
      userType: true,
      studentNumber: true,
      userNIF: true,
      userContact: {
        include: {
          contact: {
            include: {
              contactType: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new AppError('Utilizador não encontrado.', 404);
  }

  return user;
};

export const createUserService = async (body: unknown) => {
  const {
    user_name,
    user_birth_date,
    user_start_date,
    user_type_id,
    user_is_active,
    student_number,
    user_nif,
  } = createUserSchema.parse(body);

  const createdUser = await prisma.user.create({
    data: {
      userName: user_name,
      userBirthDate: user_birth_date ? new Date(user_birth_date) : null,
      userStartDate: user_start_date ? new Date(user_start_date) : null,
      userTypeId: user_type_id,
      userIsActive: user_is_active,
    },
  });

  if (student_number) {
    await prisma.studentNumber.create({
      data: {
        userId: createdUser.userId,
        studentNumber: student_number,
      },
    });
  }

  if (user_nif) {
    await prisma.userNIF.create({
      data: {
        userId: createdUser.userId,
        userNif: user_nif,
      },
    });
  }

  return prisma.user.findUnique({
    where: { userId: createdUser.userId },
    include: {
      userType: true,
      studentNumber: true,
      userNIF: true,
    },
  });
};

export const updateUserService = async (params: unknown, body: unknown) => {
  const { id } = userIdSchema.parse(params);
  const parsedBody = updateUserSchema.parse(body);

  const existingUser = await prisma.user.findUnique({
    where: { userId: id },
    select: { userId: true },
  });

  if (!existingUser) {
    throw new AppError('Utilizador não encontrado.', 404);
  }

  const dataToUpdate: Record<string, unknown> = {};

  if (parsedBody.user_name !== undefined) {
    dataToUpdate.userName = parsedBody.user_name;
  }

  if (parsedBody.user_birth_date !== undefined) {
    dataToUpdate.userBirthDate = parsedBody.user_birth_date
      ? new Date(parsedBody.user_birth_date)
      : null;
  }

  if (parsedBody.user_start_date !== undefined) {
    dataToUpdate.userStartDate = parsedBody.user_start_date
      ? new Date(parsedBody.user_start_date)
      : null;
  }

  if (parsedBody.user_type_id !== undefined) {
    dataToUpdate.userTypeId = parsedBody.user_type_id;
  }

  if (parsedBody.user_is_active !== undefined) {
    dataToUpdate.userIsActive = parsedBody.user_is_active;
  }

  return prisma.user.update({
    where: { userId: id },
    data: dataToUpdate,
    include: {
      userType: true,
      studentNumber: true,
      userNIF: true,
    },
  });
};