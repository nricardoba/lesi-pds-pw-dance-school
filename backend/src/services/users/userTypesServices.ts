import { prisma } from '../../config/db';

export const listUserTypesService = async () => {
  return prisma.userType.findMany({
    orderBy: { userTypeId: 'asc' },
  });
};
