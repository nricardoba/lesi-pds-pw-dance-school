import { useState, useEffect } from 'react';
import { listClassesRequest } from '../services/classes';
import {
  readScheduleClassesFromStorage,
  writeScheduleClassesToStorage
} from '../utils/scheduleStorage';
import { WEEK_DAYS_META, formatDateForInput } from '../utils/scheduleUtils';

export const useScheduleData = (token) => {
  const [classesData, setClassesData] = useState(() => readScheduleClassesFromStorage());

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        if (!token) return;

        const fetchedClasses = await listClassesRequest(token);

        const mappedClasses = fetchedClasses.map((backendClass) => {
          const startDate = new Date(backendClass.classDateStart);
          const endDate = new Date(backendClass.classDateEnd);

          const startDec = startDate.getHours() + startDate.getMinutes() / 60;
          const endDec = endDate.getHours() + endDate.getMinutes() / 60;
          const duration = endDec - startDec;

          const dayOfWeekIndex = startDate.getDay() === 0 ? 6 : startDate.getDay() - 1;
          const dayName = WEEK_DAYS_META[dayOfWeekIndex]?.day || 'SEGUNDA';


          const professor = backendClass.userClass?.find((uc) =>
            ['Professor Responsável', 'Professor Assistente'].includes(
              uc.userClassRole?.userClassRoleDesc
            )
          );

          const instructorId = professor?.user?.userId || '';
          const instructorName = professor?.user?.userName || 'Sem professor';

          const studentsCount =
            backendClass.userClass?.filter(
              (uc) => uc.userClassRole?.userClassRoleDesc === 'Aluno'
            ).length || 0;

          const studioCapacity = backendClass.studioModality?.studio?.studioMaxCapacity || 0;

          return {
            id: backendClass.classId,
            day: dayName,
            start: startDec,
            duration: duration > 0 ? duration : 1.5,
            name: backendClass.studioModality?.modality?.modalityName || 'Aula',
            instructor: String(instructorId),
            instructorId: String(instructorId),
            instructorName,
            room: String(backendClass.studioModality?.studio?.studioId || ''),
            roomName: backendClass.studioModality?.studio?.studioName || 'Estúdio',
            category: String(backendClass.studioModality?.modality?.modalityId || ''),
            categoryName: backendClass.studioModality?.modality?.modalityName || 'Geral',
            studioModalityId: backendClass.studioModality?.studioModalityId || '',
            occupancy: `${studentsCount}/${studioCapacity}`,
            classDate: formatDateForInput(startDate),
            schoolYear: String(
              backendClass.schoolYearId || backendClass.schoolYear?.schoolYearId || ''
            )
          };
        });

        // Backend is the source of truth when authenticated.
        // Always sync, including empty lists, to avoid stale local "ghost" classes.
        setClassesData(mappedClasses);
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };

    fetchClasses();
  }, [token]);

  useEffect(() => {
    writeScheduleClassesToStorage(classesData);
  }, [classesData]);

  return { classesData, setClassesData };
};