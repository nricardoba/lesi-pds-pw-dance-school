import { ScheduleVacancy } from '@prisma/client';
import { prisma } from '../../config/db';
import { AppError } from '../../utils/appError';

export const getAllScheduleVacanciesService = async (): Promise<ScheduleVacancy[]> => {
  return await prisma.scheduleVacancy.findMany({
    include: {
      user: {
        select: {
          userName: true
        }
      },
      schoolYear: {
        select: {
          schoolYearName: true
        }
      }
    }
  });
};

export const getScheduleVacancyByIdService = async (id: number): Promise<ScheduleVacancy> => {
  const vacancy = await prisma.scheduleVacancy.findUnique({
    where: { scheduleVacancyId: id },
    include: {
      user: {
        select: {
          userName: true
        }
      },
      schoolYear: {
        select: {
          schoolYearName: true
        }
      }
    }
  });

  if (!vacancy) {
    throw new AppError('Disponibilidade não encontrada', 404);
  }

  return vacancy;
};

export const getScheduleVacanciesByUserIdService = async (userId: number): Promise<ScheduleVacancy[]> => {
  return await prisma.scheduleVacancy.findMany({
    where: { userId },
    include: {
      schoolYear: {
        select: {
          schoolYearName: true
        }
      }
    }
  });
};

export const createScheduleVacancyService = async (data: any): Promise<ScheduleVacancy> => {
  const { userId, schoolYearId, scheduleVacancyStart, scheduleVacancyEnd, scheduleVacancyRecurrence } = data;

  const start = new Date(scheduleVacancyStart);
  const end = new Date(scheduleVacancyEnd);

  if (start >= end) {
    throw new AppError('A hora de fim deve ser posterior à hora de início', 400);
  }

  return await prisma.scheduleVacancy.create({
    data: {
      userId,
      schoolYearId,
      scheduleVacancyStart: start,
      scheduleVacancyEnd: end,
      scheduleVacancyRecurrence: scheduleVacancyRecurrence ?? false
    }
  });
};

export const updateScheduleVacancyService = async (id: number, data: any): Promise<ScheduleVacancy> => {
  const vacancy = await prisma.scheduleVacancy.findUnique({
    where: { scheduleVacancyId: id }
  });

  if (!vacancy) {
    throw new AppError('Disponibilidade não encontrada', 404);
  }

  const start = data.scheduleVacancyStart ? new Date(data.scheduleVacancyStart) : vacancy.scheduleVacancyStart;
  const end = data.scheduleVacancyEnd ? new Date(data.scheduleVacancyEnd) : vacancy.scheduleVacancyEnd;

  if (start >= end) {
    throw new AppError('A hora de fim deve ser posterior à hora de início', 400);
  }

  return await prisma.scheduleVacancy.update({
    where: { scheduleVacancyId: id },
    data: {
      userId: data.userId ?? vacancy.userId,
      schoolYearId: data.schoolYearId ?? vacancy.schoolYearId,
      scheduleVacancyStart: start,
      scheduleVacancyEnd: end,
      scheduleVacancyRecurrence: data.scheduleVacancyRecurrence ?? vacancy.scheduleVacancyRecurrence
    }
  });
};

export const deleteScheduleVacancyService = async (id: number): Promise<void> => {
  const vacancy = await prisma.scheduleVacancy.findUnique({
    where: { scheduleVacancyId: id }
  });

  if (!vacancy) {
    throw new AppError('Disponibilidade não encontrada', 404);
  }

  await prisma.scheduleVacancy.delete({
    where: { scheduleVacancyId: id }
  });
};
