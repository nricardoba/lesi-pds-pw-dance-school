import { prisma } from "../config/db";
import { AppError } from "../utils/appError";

interface CreateRentItemInput {
  userId: number;
  itemId: number;
  rentDateStart: Date;
  rentDateEnd: Date;
}

export const createRentalService = async (data: CreateRentItemInput) => {
  // Check if school item exists
  const schoolItem = await prisma.schoolItem.findUnique({
    where: { itemId: data.itemId },
  });
  if (!schoolItem) {
    throw new AppError("School Item not found", 404);
  }

  // Check if the user exists
  const user = await prisma.user.findUnique({
    where: { userId: data.userId },
  });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Prevent double-renting if we only allow one active rental per item
  const activeRental = await prisma.rentItem.findFirst({
    where: {
      itemId: data.itemId,
      actualRentDateEnd: null,
    },
  });

  if (activeRental) {
    throw new AppError("Item is already rented", 400);
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

export const returnRentalService = async (
  id: number,
  actualRentDateEnd: Date,
  itemDamaged?: boolean,
) => {
  const rental = await prisma.rentItem.findUnique({ where: { rentId: id } });

  if (!rental) {
    throw new AppError("Rental not found", 404);
  }

  const updatedRental = await prisma.rentItem.update({
    where: { rentId: id },
    data: {
      actualRentDateEnd,
      itemDamaged: itemDamaged ?? false,
    },
  });

  return updatedRental;
};

export const listRentalsService = async () => {
  return await prisma.rentItem.findMany({
    include: {
      user: true,
      schoolItem: {
        include: {
          item: true,
        },
      },
    },
  });
};

export const getRentalByIdService = async (id: number) => {
  const rental = await prisma.rentItem.findUnique({
    where: { rentId: id },
    include: {
      user: true,
      schoolItem: {
        include: {
          item: true,
        },
      },
    },
  });

  if (!rental) {
    throw new AppError("Rental not found", 404);
  }

  return rental;
};

export const deleteRentalService = async (id: number) => {
  const rental = await prisma.rentItem.findUnique({ where: { rentId: id } });

  if (!rental) {
    throw new AppError("Rental not found", 404);
  }

  await prisma.rentItem.delete({
    where: { rentId: id },
  });
};
