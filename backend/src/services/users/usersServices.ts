import { z } from "zod";
import { prisma } from "../../config/db";
import { AppError } from "../../utils/appError";

const userIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const createUserSchema = z.object({
  userName: z.string().min(1),
  userBirthDate: z.string().optional().nullable(),
  userStartDate: z.string().optional().nullable(),
  userTypeId: z.coerce.number().int().positive(),
  userIsActive: z.coerce.boolean(),
  studentNumber: z.string().optional(),
  userNif: z.string().optional(),
});

const updateUserSchema = z.object({
  userName: z.string().min(1).optional(),
  userBirthDate: z.string().optional().nullable(),
  userStartDate: z.string().optional().nullable(),
  userTypeId: z.coerce.number().int().positive().optional(),
  userIsActive: z.coerce.boolean().optional(),
});

export const listUsersService = async () => {
  return prisma.user.findMany({
    include: {
      userType: true,
      studentNumber: true,
      userContact: {
        include: {
          contact: {
            include: {
              contactType: true,
            }
          }
        }
      }
    },
    orderBy: {
      userId: "asc",
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
    throw new AppError("Utilizador não encontrado.", 404);
  }

  return user;
};

export const getUsersByIdsService = async (userIds: number[]) => {
  return prisma.user.findMany({
    where: { userId: { in: userIds } },
    select: { userId: true },
  });
};

export const createUserService = async (body: unknown) => {
  const {
    userName,
    userBirthDate,
    userStartDate,
    userTypeId,
    userIsActive,
    studentNumber,
    userNif,
  } = createUserSchema.parse(body);

  const createdUser = await prisma.user.create({
    data: {
      userName,
      userBirthDate: userBirthDate ? new Date(userBirthDate) : null,
      userStartDate: userStartDate ? new Date(userStartDate) : null,
      userTypeId,
      userIsActive,
    },
  });

  if (studentNumber) {
    await prisma.studentNumber.create({
      data: {
        userId: createdUser.userId,
        studentNumber,
      },
    });
  }

  if (userNif) {
    await prisma.userNIF.create({
      data: {
        userId: createdUser.userId,
        userNif,
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
    throw new AppError("Utilizador não encontrado.", 404);
  }

  const dataToUpdate: Record<string, unknown> = {};

  if (parsedBody.userName !== undefined) {
    dataToUpdate.userName = parsedBody.userName;
  }

  if (parsedBody.userBirthDate !== undefined) {
    dataToUpdate.userBirthDate = parsedBody.userBirthDate
      ? new Date(parsedBody.userBirthDate)
      : null;
  }

  if (parsedBody.userStartDate !== undefined) {
    dataToUpdate.userStartDate = parsedBody.userStartDate
      ? new Date(parsedBody.userStartDate)
      : null;
  }

  if (parsedBody.userTypeId !== undefined) {
    dataToUpdate.userTypeId = parsedBody.userTypeId;
  }

  if (parsedBody.userIsActive !== undefined) {
    dataToUpdate.userIsActive = parsedBody.userIsActive;
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
