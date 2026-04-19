export const SCHEDULE_CLASSES_STORAGE_KEY = 'scheduleClasses';
export const CLASS_TEMPLATES_STORAGE_KEY = 'classTemplates';
export const COACHINGS_STORAGE_KEY = 'coachings';

const safeJsonParse = (value, fallback) => {
  try {
    if (!value) {
      return fallback;
    }

    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

export const readScheduleClassesFromStorage = () => {
  return safeJsonParse(localStorage.getItem(SCHEDULE_CLASSES_STORAGE_KEY), []);
};

export const writeScheduleClassesToStorage = (classes) => {
  localStorage.setItem(SCHEDULE_CLASSES_STORAGE_KEY, JSON.stringify(classes));
};

export const readClassTemplatesFromStorage = () => {
  return safeJsonParse(localStorage.getItem(CLASS_TEMPLATES_STORAGE_KEY), []);
};

export const writeClassTemplatesToStorage = (templates) => {
  localStorage.setItem(CLASS_TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
};

export const readCoachingsFromStorage = () => {
  return safeJsonParse(localStorage.getItem(COACHINGS_STORAGE_KEY), null);
};

export const writeCoachingsToStorage = (coachings) => {
  localStorage.setItem(COACHINGS_STORAGE_KEY, JSON.stringify(coachings));
};
