import { prisma } from "../config/db";
import { AppError } from "../utils/appError";

interface CreateItemCharacteristicsInput {
  name: string;
  categoryId: number;
  colorId: number;
  sizeId: number;
  danceTypeIds?: number[];
  images?: string[];
}

export const createItemCharacteristicsService = async (
  data: CreateItemCharacteristicsInput,
) => {
  const { danceTypeIds, images, name, ...characteristicData } = data;

  const newCharacteristic = await prisma.itemCharacteristics.create({
    data: {
      itemCharacteristicsName: name,
      category: { connect: { categoryId: characteristicData.categoryId } },
      color: { connect: { colorId: characteristicData.colorId } },
      size: { connect: { sizeId: characteristicData.sizeId } },
      ...(danceTypeIds && danceTypeIds.length > 0
        ? {
            itemCharacteristicsDanceType: {
              create: danceTypeIds.map((id) => ({
                danceTypeId: id,
              })),
            },
          }
        : {}),
      ...(images && images.length > 0
        ? {
            itemImage: {
              create: images.map((url, index) => ({
                itemImageUrl: url,
                itemImageIsMain: index === 0,
              })),
            },
          }
        : {}),
    },
    include: {
      itemCharacteristicsDanceType: true,
      itemImage: true,
      category: true,
      color: true,
      size: true,
    },
  });

  return newCharacteristic;
};

export const updateItemCharacteristicsService = async (
  id: number,
  data: Partial<CreateItemCharacteristicsInput>,
) => {
  const existing = await prisma.itemCharacteristics.findUnique({
    where: { itemCharacteristicsId: id },
  });
  if (!existing) {
    throw new AppError("Item Characteristics not found", 404);
  }

  const { danceTypeIds, images, name, ...characteristicData } = data;

  const updateData: any = {};
  if (name) {
    updateData.itemCharacteristicsName = name;
  }
  if (characteristicData.categoryId !== undefined) {
    updateData.category = {
      connect: { categoryId: characteristicData.categoryId },
    };
  }
  if (characteristicData.colorId !== undefined) {
    updateData.color = { connect: { colorId: characteristicData.colorId } };
  }
  if (characteristicData.sizeId !== undefined) {
    updateData.size = { connect: { sizeId: characteristicData.sizeId } };
  }

  const updated = await prisma.itemCharacteristics.update({
    where: { itemCharacteristicsId: id },
    data: updateData,
    include: {
      itemCharacteristicsDanceType: true,
      itemImage: true,
      category: true,
      color: true,
      size: true,
    },
  });

  return updated;
};

export const listItemCharacteristicsService = async () => {
  return await prisma.itemCharacteristics.findMany({
    include: {
      category: true,
      color: true,
      size: true,
      itemCharacteristicsDanceType: {
        include: { danceType: true },
      },
      itemImage: true,
    },
  });
};

export const getItemCharacteristicsByIdService = async (id: number) => {
  const characteristic = await prisma.itemCharacteristics.findUnique({
    where: { itemCharacteristicsId: id },
    include: {
      category: true,
      color: true,
      size: true,
      itemCharacteristicsDanceType: {
        include: { danceType: true },
      },
      itemImage: true,
    },
  });

  if (!characteristic) {
    throw new AppError("Item Characteristics not found", 404);
  }

  return characteristic;
};

export const deleteItemCharacteristicsService = async (id: number) => {
  const existing = await prisma.itemCharacteristics.findUnique({
    where: { itemCharacteristicsId: id },
  });
  if (!existing) {
    throw new AppError("Item Characteristics not found", 404);
  }

  // Delete related images and dance types first if not cascading
  await prisma.itemImage.deleteMany({ where: { itemCharacteristicsId: id } });
  await prisma.itemCharacteristicsDanceType.deleteMany({
    where: { itemCharacteristicsId: id },
  });

  await prisma.itemCharacteristics.delete({
    where: { itemCharacteristicsId: id },
  });
};

export const addItemImageService = async (
  itemCharacteristicsId: number,
  url: string,
) => {
  const existing = await prisma.itemCharacteristics.findUnique({
    where: { itemCharacteristicsId },
  });
  if (!existing) {
    throw new AppError("Item Characteristics not found", 404);
  }

  return await prisma.itemImage.create({
    data: {
      itemCharacteristicsId,
      itemImageUrl: url,
      itemImageIsMain: false,
    },
  });
};

export const removeItemImageService = async (itemImageId: number) => {
  const existing = await prisma.itemImage.findUnique({
    where: { itemImageId },
  });
  if (!existing) {
    throw new AppError("Item Image not found", 404);
  }

  await prisma.itemImage.delete({ where: { itemImageId } });
};
