import { z } from "zod";
import { prisma } from "../../config/db";
import { AppError } from "../../utils/appError";

const rentalIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const createRentalSchema = z.object({
  userId: z.coerce.number().int().positive(),
  itemId: z.coerce.number().int().positive(),
  rentDateStart: z
    .string()
    .datetime()
    .or(z.date())
    .transform((val) => new Date(val)),
  rentDateEnd: z
    .string()
    .datetime()
    .or(z.date())
    .transform((val) => new Date(val)),
});

const returnRentalSchema = z.object({
  actualRentDateEnd: z
    .string()
    .datetime()
    .or(z.date())
    .transform((val) => new Date(val)),
  itemDamaged: z.boolean().optional(),
});

export const createRentalService = async (body: unknown) => {
  const data = createRentalSchema.parse(body);

  // Check if school item exists
  const schoolItem = await prisma.schoolItem.findUnique({
    where: { itemId: data.itemId },
  });
  if (!schoolItem) {
    throw new AppError("Item não encontrado.", 404);
  }

  // Check if the user exists
  const user = await prisma.user.findUnique({
    where: { userId: data.userId },
  });
  if (!user) {
    throw new AppError("Utilizador não encontrado.", 404);
  }

  // Prevent double-renting if we only allow one active rental per item
  const activeRental = await prisma.rentItem.findFirst({
    where: {
      itemId: data.itemId,
      actualRentDateEnd: null,
    },
  });

  if (activeRental) {
    throw new AppError("O item já se encontra alugado.", 400);
  }

  const rental = await prisma.rentItem.create({
    data: {
      userId: data.userId,
      itemId: data.itemId,
      rentDateStart: data.rentDateStart,
      rentDateEnd: data.rentDateEnd,
    },
  });

  return rental;
};

export const returnRentalService = async (params: unknown, body: unknown) => {
  const { id } = rentalIdSchema.parse(params);
  const data = returnRentalSchema.parse(body);

  const rental = await prisma.rentItem.findUnique({ where: { rentId: id } });

  if (!rental) {
    throw new AppError("Aluguer não encontrado.", 404);
  }

  const updatedRental = await prisma.rentItem.update({
    where: { rentId: id },
    data: {
      actualRentDateEnd: data.actualRentDateEnd,
      itemDamaged: data.itemDamaged ?? false,
    },
  });

  return updatedRental;
};

export const listRentalsService = async () => {
  return await prisma.rentItem.findMany({
    include: {
      user: {
        include: {
          studentNumber: true,
        },
      },
      schoolItem: {
        include: {
          item: {
            include: {
              itemCondition: true,
              itemCharacteristics: {
                include: {
                  category: true,
                  size: true,
                  color: true,
                  itemImage: true,
                },
              },
            },
          },
        },
      },
    },
  });
};

export const getRentalByIdService = async (params: unknown) => {
  const { id } = rentalIdSchema.parse(params);

  const rental = await prisma.rentItem.findUnique({
    where: { rentId: id },
    include: {
      user: {
        include: {
          studentNumber: true,
        },
      },
      schoolItem: {
        include: {
          item: {
            include: {
              itemCondition: true,
              itemCharacteristics: {
                include: {
                  category: true,
                  size: true,
                  color: true,
                  itemImage: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!rental) {
    throw new AppError("Aluguer não encontrado.", 404);
  }

  return rental;
};

export const deleteRentalService = async (params: unknown) => {
  const { id } = rentalIdSchema.parse(params);

  const rental = await prisma.rentItem.findUnique({ where: { rentId: id } });

  if (!rental) {
    throw new AppError("Aluguer não encontrado.", 404);
  }

  await prisma.rentItem.delete({
    where: { rentId: id },
  });
};
