export const WEEK_DAYS_META = [
  { day: 'SEGUNDA', short: 'SEG' },
  { day: 'TERÇA', short: 'TER' },
  { day: 'QUARTA', short: 'QUA' },
  { day: 'QUINTA', short: 'QUI' },
  { day: 'SEXTA', short: 'SEX' },
  { day: 'SÁBADO', short: 'SÁB' },
  { day: 'DOMINGO', short: 'DOM' }
];

export const pad2 = (value) => String(value).padStart(2, '0');

export const formatDateForInput = (date) => {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
};

export const getMondayOfWeek = (inputDate) => {
  const date = new Date(inputDate);
  date.setHours(12, 0, 0, 0);

  const day = date.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + offset);

  return date;
};

export const buildWeekFromDate = (inputDate) => {
  const monday = getMondayOfWeek(inputDate);

  return WEEK_DAYS_META.map((meta, index) => {
    const fullDate = new Date(monday);
    fullDate.setDate(monday.getDate() + index);

    return {
      ...meta,
      date: String(fullDate.getDate()),
      fullDate
    };
  });
};

export const getDateFromIso = (isoDate) => new Date(`${isoDate}T12:00:00`);

export const toHourDecimal = (hourString) => {
  const [h = '0', m = '0'] = String(hourString || '08:00').split(':');
  return parseInt(h, 10) + parseInt(m, 10) / 60;
};

export const decimalToHourString = (decimalHour) => {
  const safeValue = Number.isFinite(decimalHour) ? decimalHour : 8;
  const h = Math.floor(safeValue);
  const m = Math.round((safeValue - h) * 60);
  return `${pad2(h)}:${pad2(m)}`;
};

export const buildDayClassesLayout = (dayClasses) => {
  const sortedClasses = [...dayClasses].sort((a, b) => {
    if (a.start === b.start) {
      return b.duration - a.duration;
    }

    return a.start - b.start;
  });

  const layoutMap = {};
  let active = [];
  let clusterIds = [];
  let clusterMaxColumns = 0;

  const finalizeCluster = () => {
    if (!clusterIds.length) {
      return;
    }

    clusterIds.forEach((classId) => {
      layoutMap[classId].columns = clusterMaxColumns;
    });

    clusterIds = [];
    clusterMaxColumns = 0;
  };

  sortedClasses.forEach((classItem) => {
    const classStart = classItem.start;

    active = active.filter((activeItem) => activeItem.end > classStart);

    if (!active.length) {
      finalizeCluster();
    }

    const usedColumns = new Set(active.map((activeItem) => activeItem.column));
    let selectedColumn = 0;

    while (usedColumns.has(selectedColumn)) {
      selectedColumn += 1;
    }

    layoutMap[classItem.id] = {
      column: selectedColumn,
      columns: 1
    };

    clusterIds.push(classItem.id);

    active.push({
      end: classItem.start + classItem.duration,
      column: selectedColumn,
      id: classItem.id
    });

    clusterMaxColumns = Math.max(clusterMaxColumns, active.length);
  });

  finalizeCluster();

  return layoutMap;
};
