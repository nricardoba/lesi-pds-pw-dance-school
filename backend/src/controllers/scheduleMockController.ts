import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { prisma } from '../config/db';

export const getScheduleSubmissions = catchAsync(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId, 10);

    const vacancies = await prisma.scheduleVacancy.findMany({
        where: { userId },
        include: { user: true }
    });

    // Group by schoolYearId and submission date (using creation date which we don't have, so we group by schoolYearId and scheduleVacancyRecurrence)
    // To simulate submission we'll just return a single pseudo-group for "pending" ones if they exist
    // and another for "approved". Let's group by scheduleVacancyRecurrence as a proxy for the submission status

    const pendingVacancies = vacancies.filter(v => v.scheduleVacancyRecurrence === true);
    const approvedVacancies = vacancies.filter(v => v.scheduleVacancyRecurrence === false);

    const submissions = [];

    if (pendingVacancies.length > 0) {
        submissions.push({
            scheduleSubmissionId: 1, // pseudo ID
            userId: userId,
            schoolYearId: pendingVacancies[0].schoolYearId,
            submissionDate: pendingVacancies[0].scheduleVacancyStart,
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
            submissionDate: approvedVacancies[0].scheduleVacancyStart,
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

    res.status(200).json(submissions);
});

export const getAllScheduleSubmissions = catchAsync(async (req: Request, res: Response) => {
    // Get all schedule vacancies grouped by user
    const vacancies = await prisma.scheduleVacancy.findMany({
        include: { user: true }
    });

    const userIds = [...new Set(vacancies.map(v => v.userId))];
    const submissions = [];

    for (const userId of userIds) {
        const userVacancies = vacancies.filter(v => v.userId === userId);
        const pendingVacancies = userVacancies.filter(v => v.scheduleVacancyRecurrence === true);
        const approvedVacancies = userVacancies.filter(v => v.scheduleVacancyRecurrence === false);

        if (pendingVacancies.length > 0) {
            submissions.push({
                scheduleSubmissionId: `${userId}_pending`, // Pseudo ID
                userId: userId,
                schoolYearId: pendingVacancies[0].schoolYearId,
                submissionDate: pendingVacancies[0].scheduleVacancyStart,
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
                submissionDate: approvedVacancies[0].scheduleVacancyStart,
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
    }

    res.status(200).json(submissions);
});

export const getLatestSubmissionStatus = catchAsync(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId, 10);
    
    // Simplest logic: if there are pending vacanices, return pending, else if approved, return approved
    const pendingVacancies = await prisma.scheduleVacancy.findMany({
        where: { userId, scheduleVacancyRecurrence: true }
    });

    if (pendingVacancies.length > 0) {
        return res.status(200).json({
            submissionDate: pendingVacancies[0].scheduleVacancyStart,
            reviewDate: null,
            status: { scheduleSubmissionStatusDesc: 'Pendente' },
            scheduleVacancies: pendingVacancies
        });
    }

    const approvedVacancies = await prisma.scheduleVacancy.findMany({
        where: { userId, scheduleVacancyRecurrence: false }
    });

    if (approvedVacancies.length > 0) {
        return res.status(200).json({
            submissionDate: approvedVacancies[0].scheduleVacancyStart,
            reviewDate: new Date(),
            status: { scheduleSubmissionStatusDesc: 'Aprovado' },
            scheduleVacancies: approvedVacancies
        });
    }

    res.status(200).json(null);
});

export const submitSchedule = catchAsync(async (req: Request, res: Response) => {
    const { userId, schoolYearId, vacancies } = req.body;

    // Delete existing pending vacancies for this user to simplify
    await prisma.scheduleVacancy.deleteMany({
        where: {
            userId: parseInt(userId, 10),
            scheduleVacancyRecurrence: true
        }
    });

    // Create new pending vacancies
    const createdVacancies = [];
    for (const v of vacancies) {
        const startDate = getNextDayOfWeek(v.day_of_week, v.start_time);
        const endDate = getNextDayOfWeek(v.day_of_week, v.end_time);

        const newV = await prisma.scheduleVacancy.create({
            data: {
                userId: parseInt(userId, 10),
                schoolYearId: parseInt(schoolYearId, 10),
                scheduleVacancyStart: startDate,
                scheduleVacancyEnd: endDate,
                scheduleVacancyRecurrence: true // true means PENDENTE
            }
        });
        createdVacancies.push(newV);
    }

    res.status(201).json(createdVacancies);
});

export const reviewScheduleSubmission = catchAsync(async (req: Request, res: Response) => {
    // We don't have a real submission ID, so we will use the pseudo ID or just the userId which is sent from frontend indirectly
    // For simplicity, let's just approve ALL pending vacancies for the user
    // The frontend sends reviewData like { status: 'Aprovado' }
    
    // In our pseudo logic, submissionId 1 was Pendent. 
    // And actually we need the `userId` to update.
    // The frontend passes `submissionId`. Which we set to 1 for 'Pendent' user.
    // Let's assume `submissionId` is the `userId` for now to make it easy, or we can just update all pending.
    // We'll update all pending vacancies globally to false if state is 'Aprovado', or delete them if 'Rejeitado'

    const { status } = req.body;
    const submissionIdStr = req.params.submissionId;
    const userId = parseInt(submissionIdStr, 10);

    const isPendingTarget = submissionIdStr.includes('_pending') || !submissionIdStr.includes('_approved');
    const targetState = isPendingTarget ? true : false;

    if (status === 'Rejeitado') {
        await prisma.scheduleVacancy.deleteMany({
            where: { userId: userId, scheduleVacancyRecurrence: targetState }
        });
    } else {
        if (isPendingTarget) {
            await prisma.scheduleVacancy.updateMany({
                where: { userId: userId, scheduleVacancyRecurrence: true },
                data: { scheduleVacancyRecurrence: false } // false means APROVADO
            });
        }
    }

    res.status(200).json({ success: true });
});

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
