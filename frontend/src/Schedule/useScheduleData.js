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

          const instructor =
            backendClass.userClass?.find(
              (uc) => uc.userClassRole?.userClassRoleName === 'Professor'
            )?.user?.userName || 'Sem professor';

          return {
            id: backendClass.classId,
            day: dayName,
            start: startDec,
            duration: duration > 0 ? duration : 1.5,
            name: backendClass.studioModality?.modality?.modalityName || 'Aula',
            instructor,
            room: backendClass.studioModality?.studio?.studioDesignation || 'Estúdio',
            level: 'Geral',
            category: backendClass.studioModality?.modality?.modalityName || 'Geral',
            occupancy: `${backendClass.userClass?.length || 0}/20`,
            classDate: formatDateForInput(startDate)
          };
        });

        if (mappedClasses.length > 0) {
          setClassesData(mappedClasses);
        }
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