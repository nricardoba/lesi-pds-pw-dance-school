import { prisma } from "../config/db";
import { AppError } from "../utils/AppError";

// --- Category ---
export const listCategoriesService = async () => {
  return await prisma.category.findMany();
};

export const createCategoryService = async (data: { name: string }) => {
  return await prisma.category.create({
    data: {
      categoryName: data.name,
    },
  });
};

export const updateCategoryService = async (
  id: number,
  data: { name?: string },
) => {
  return await prisma.category.update({
    where: { categoryId: id },
    data: {
      ...(data.name && { categoryName: data.name }),
    },
  });
};

export const deleteCategoryService = async (id: number) => {
  return await prisma.category.delete({ where: { categoryId: id } });
};

// --- Color ---
export const listColorsService = async () => {
  return await prisma.color.findMany();
};

export const createColorService = async (data: {
  name: string;
  hex?: string;
}) => {
  return await prisma.color.create({
    data: {
      colorName: data.name,
      ...(data.hex && { colorHex: data.hex }),
    } as any, // casting to any to allow optional hex if it's not strictly typed in schema
  });
};

export const updateColorService = async (
  id: number,
  data: { name?: string; hex?: string },
) => {
  return await prisma.color.update({
    where: { colorId: id },
    data: {
      ...(data.name && { colorName: data.name }),
      ...(data.hex && { colorHex: data.hex }),
    } as any,
  });
};

export const deleteColorService = async (id: number) => {
  return await prisma.color.delete({ where: { colorId: id } });
};

// --- Size ---
export const listSizesService = async () => {
  return await prisma.size.findMany();
};

export const createSizeService = async (data: { name: string }) => {
  return await prisma.size.create({
    data: {
      sizeName: data.name,
    },
  });
};

export const updateSizeService = async (
  id: number,
  data: { name?: string },
) => {
  return await prisma.size.update({
    where: { sizeId: id },
    data: {
      ...(data.name && { sizeName: data.name }),
    },
  });
};

export const deleteSizeService = async (id: number) => {
  return await prisma.size.delete({ where: { sizeId: id } });
};

// --- Item Condition ---
export const listItemConditionsService = async () => {
  return await prisma.itemCondition.findMany();
};

export const createItemConditionService = async (data: { name: string }) => {
  return await prisma.itemCondition.create({
    data: {
      itemConditionName: data.name,
    },
  });
};

export const updateItemConditionService = async (
  id: number,
  data: { name?: string },
) => {
  return await prisma.itemCondition.update({
    where: { itemConditionId: id },
    data: {
      ...(data.name && { itemConditionName: data.name }),
    },
  });
};

export const deleteItemConditionService = async (id: number) => {
  return await prisma.itemCondition.delete({ where: { itemConditionId: id } });
};

// --- Dance Type ---
export const listDanceTypesService = async () => {
  return await prisma.danceType.findMany();
};

export const createDanceTypeService = async (data: { name: string }) => {
  return await prisma.danceType.create({
    data: {
      danceTypeName: data.name,
    },
  });
};

export const updateDanceTypeService = async (
  id: number,
  data: { name?: string },
) => {
  return await prisma.danceType.update({
    where: { danceTypeId: id },
    data: {
      ...(data.name && { danceTypeName: data.name }),
    },
  });
};

export const deleteDanceTypeService = async (id: number) => {
  return await prisma.danceType.delete({ where: { danceTypeId: id } });
};
