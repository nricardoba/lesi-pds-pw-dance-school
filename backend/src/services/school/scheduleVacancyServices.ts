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

  const userExists = await prisma.user.findUnique({
    where: { userId }
  });
  if (!userExists) {
    throw new AppError('Utilizador não encontrado', 404);
  }

  const schoolYearExists = await prisma.schoolYear.findUnique({
    where: { schoolYearId }
  });
  if (!schoolYearExists) {
    throw new AppError('Ano letivo não encontrado', 404);
  }

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

  const newUserId = data.userId ?? vacancy.userId;
  const newSchoolYearId = data.schoolYearId ?? vacancy.schoolYearId;

  // Validar se o novo utilizador existe (apenas se foi alterado)
  if (data.userId) {
    const userExists = await prisma.user.findUnique({
      where: { userId: newUserId }
    });
    if (!userExists) {
      throw new AppError('Utilizador não encontrado', 404);
    }
  }

  // Validar se o novo ano letivo existe (apenas se foi alterado)
  if (data.schoolYearId) {
    const schoolYearExists = await prisma.schoolYear.findUnique({
      where: { schoolYearId: newSchoolYearId }
    });
    if (!schoolYearExists) {
      throw new AppError('Ano letivo não encontrado', 404);
    }
  }

  const start = data.scheduleVacancyStart ? new Date(data.scheduleVacancyStart) : vacancy.scheduleVacancyStart;
  const end = data.scheduleVacancyEnd ? new Date(data.scheduleVacancyEnd) : vacancy.scheduleVacancyEnd;

  if (start >= end) {
    throw new AppError('A hora de fim deve ser posterior à hora de início', 400);
  }

  return await prisma.scheduleVacancy.update({
    where: { scheduleVacancyId: id },
    data: {
      userId: newUserId,
      schoolYearId: newSchoolYearId,
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


export const getScheduleSubmissionsService = async (userId: number) => {

    const vacancies = await prisma.scheduleVacancy.findMany({
        where: { userId },
        include: { user: true }
    });

    const pendingVacancies = vacancies.filter(v => v.scheduleVacancyApproved == null);
    const approvedVacancies = vacancies.filter(v => v.scheduleVacancyApproved === true);
    const rejectedVacancies = vacancies.filter(v => v.scheduleVacancyApproved === false);

    const submissions = [];

    if (pendingVacancies.length > 0) {
        submissions.push({
            scheduleSubmissionId: 1, // pseudo ID
            userId: userId,
            schoolYearId: pendingVacancies[0].schoolYearId,
            submissionDate: new Date(),
            status: { scheduleSubmissionStatusDesc: 'Pendente' },
            user: pendingVacancies[0].user,
            scheduleVacancies: pendingVacancies.map(v => ({
                ...v,
                day_of_week: getDayOfWeek(v.scheduleVacancyStart),
                start_time: formatTime(v.scheduleVacancyStart),
                end_time: formatTime(v.scheduleVacancyEnd)
            }))
        });
    }

    if (approvedVacancies.length > 0) {
      submissions.push({
        scheduleSubmissionId: 2, // pseudo ID
        userId: userId,
        schoolYearId: approvedVacancies[0].schoolYearId,
        submissionDate: new Date(),
        status: { scheduleSubmissionStatusDesc: 'Aprovado' },
        user: approvedVacancies[0].user,
        scheduleVacancies: approvedVacancies.map(v => ({
          ...v,
          day_of_week: getDayOfWeek(v.scheduleVacancyStart),
          start_time: formatTime(v.scheduleVacancyStart),
          end_time: formatTime(v.scheduleVacancyEnd)
        }))
      });
    }

    if (rejectedVacancies.length > 0) {
      submissions.push({
        scheduleSubmissionId: 3, // pseudo ID
        userId: userId,
        schoolYearId: rejectedVacancies[0].schoolYearId,
        submissionDate: new Date(),
        status: { scheduleSubmissionStatusDesc: 'Rejeitado' },
        user: rejectedVacancies[0].user,
        scheduleVacancies: rejectedVacancies.map(v => ({
          ...v,
          day_of_week: getDayOfWeek(v.scheduleVacancyStart),
          start_time: formatTime(v.scheduleVacancyStart),
          end_time: formatTime(v.scheduleVacancyEnd)
        }))
      });
    }

    return submissions;
};

export const getAllScheduleSubmissionsService = async ( ) => {
    // Get all schedule vacancies grouped by user
    const vacancies = await prisma.scheduleVacancy.findMany({
        include: { user: true }
    });

    const userIds = [...new Set(vacancies.map(v => v.userId))];
    const submissions = [];

    for (const userId of userIds) {
        const userVacancies = vacancies.filter(v => v.userId === userId);
      const pendingVacancies = userVacancies.filter(v => v.scheduleVacancyApproved == null);
      const approvedVacancies = userVacancies.filter(v => v.scheduleVacancyApproved === true);
      const rejectedVacancies = userVacancies.filter(v => v.scheduleVacancyApproved === false);

        if (pendingVacancies.length > 0) {
            submissions.push({
                scheduleSubmissionId: `${userId}_pending`, // Pseudo ID
                userId: userId,
                schoolYearId: pendingVacancies[0].schoolYearId,
                submissionDate: new Date(),
                status: { scheduleSubmissionStatusDesc: 'Pendente' },
                user: pendingVacancies[0].user,
                scheduleVacancies: pendingVacancies.map(v => ({
                    ...v,
                    day_of_week: getDayOfWeek(v.scheduleVacancyStart),
                    start_time: formatTime(v.scheduleVacancyStart),
                    end_time: formatTime(v.scheduleVacancyEnd)
                }))
            });
        }

        if (approvedVacancies.length > 0) {
            submissions.push({
                scheduleSubmissionId: `${userId}_approved`, // Pseudo ID
                userId: userId,
                schoolYearId: approvedVacancies[0].schoolYearId,
                submissionDate: new Date(),
                status: { scheduleSubmissionStatusDesc: 'Aprovado' },
                user: approvedVacancies[0].user,
                scheduleVacancies: approvedVacancies.map(v => ({
                    ...v,
                    day_of_week: getDayOfWeek(v.scheduleVacancyStart),
                    start_time: formatTime(v.scheduleVacancyStart),
                    end_time: formatTime(v.scheduleVacancyEnd)
                }))
            });
        }

            if (rejectedVacancies.length > 0) {
              submissions.push({
                scheduleSubmissionId: `${userId}_rejected`, // Pseudo ID
                userId: userId,
                schoolYearId: rejectedVacancies[0].schoolYearId,
                submissionDate: new Date(),
                status: { scheduleSubmissionStatusDesc: 'Rejeitado' },
                user: rejectedVacancies[0].user,
                scheduleVacancies: rejectedVacancies.map(v => ({
                  ...v,
                  day_of_week: getDayOfWeek(v.scheduleVacancyStart),
                  start_time: formatTime(v.scheduleVacancyStart),
                  end_time: formatTime(v.scheduleVacancyEnd)
                }))
              });
            }
    }

    return submissions;
  };

export const getLatestSubmissionStatusService = async (userId: number) => {
    
    const pendingVacancies = await prisma.scheduleVacancy.findMany({
      where: { userId, scheduleVacancyApproved: null }
    });

    if (pendingVacancies.length > 0) {
      return {
        submissionDate: new Date(),
        reviewDate: null,
        status: { scheduleSubmissionStatusDesc: 'Pendente' },
        scheduleVacancies: pendingVacancies
      };
    }

    const approvedVacancies = await prisma.scheduleVacancy.findMany({
      where: { userId, scheduleVacancyApproved: true }
    });

    if (approvedVacancies.length > 0) {
      return {
        submissionDate: new Date(),
        reviewDate: new Date(),
        status: { scheduleSubmissionStatusDesc: 'Aprovado' },
        scheduleVacancies: approvedVacancies
      };
    }

    const rejectedVacancies = await prisma.scheduleVacancy.findMany({
        where: { userId, scheduleVacancyApproved: false }
    });

    if (rejectedVacancies.length > 0) {
      return {
        submissionDate: new Date(),
        reviewDate: new Date(),
        status: { scheduleSubmissionStatusDesc: 'Rejeitado' },
        scheduleVacancies: rejectedVacancies
      };
    }

    return null;
  };

export const submitScheduleService = async (userId: number, schoolYearId: number, vacancies: any[]) => {
  // Delete only the current pending draft so rejected history remains visible.
    await prisma.scheduleVacancy.deleteMany({
        where: {
      userId,
      scheduleVacancyApproved: null
        }
    });

    // Create new pending vacancies
    const createdVacancies = [];
    for (const v of vacancies) {
        const startDate = getNextDayOfWeek(v.day_of_week, v.start_time);
        const endDate = getNextDayOfWeek(v.day_of_week, v.end_time);

        const newV = await prisma.scheduleVacancy.create({
            data: {
            userId,
            schoolYearId,
                scheduleVacancyStart: startDate,
                scheduleVacancyEnd: endDate,
            scheduleVacancyRecurrence: true,
            scheduleVacancyApproved: null
            }
        });
        createdVacancies.push(newV);
    }

    return createdVacancies;
};

export const reviewScheduleSubmissionService = async (userId: number, status: string) => {
    // We don't have a real submission ID, so we will use the pseudo ID or just the userId which is sent from frontend indirectly
    // For simplicity, let's just approve ALL pending vacancies for the user
    // The frontend sends reviewData like { status: 'Aprovado' }
    
    // In our pseudo logic, submissionId 1 was Pendent. 
    // And actually we need the `userId` to update.
    // The frontend passes `submissionId`. Which we set to 1 for 'Pendent' user.
    // Let's assume `submissionId` is the `userId` for now to make it easy, or we can just update all pending.
    // We'll update all pending vacancies globally to approved/rejected flags while keeping the record.

    if (status === 'Aprovado') {
        await prisma.scheduleVacancy.updateMany({
        where: { userId: userId, scheduleVacancyApproved: null },
        data: { scheduleVacancyApproved: true }
      });
    } else if (status === 'Rejeitado') {
      await prisma.scheduleVacancy.updateMany({
        where: { userId: userId, scheduleVacancyApproved: null },
        data: { scheduleVacancyApproved: false }
        });
    }

    return { success: true };
};

// Helper functions to map days of week strings to dates back and forth
function getDayOfWeek(date: Date): string {
    const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    return days[date.getDay()];
}

function formatTime(date: Date): string {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function getNextDayOfWeek(dayName: string, timeStr: string): Date {
    const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    let targetDay = days.indexOf(dayName);
    
    // fallback se vier "Segunda" em vez de "Segunda-feira"
    if (targetDay === -1) {
        targetDay = days.findIndex(d => d.startsWith(dayName));
    }
    
    const now = new Date();
    const currentDay = now.getDay();
    let diff = targetDay - currentDay;
    if (diff < 0) diff += 7;
    
    const [hours, minutes] = timeStr.split(':').map(Number);
    const nextDate = new Date(now.getTime() + diff * 24 * 60 * 60 * 1000);
    nextDate.setHours(hours, minutes, 0, 0);
    return nextDate;
}
