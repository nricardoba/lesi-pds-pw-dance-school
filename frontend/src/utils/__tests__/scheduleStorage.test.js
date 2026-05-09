import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CLASS_TEMPLATES_STORAGE_KEY,
  SCHEDULE_CLASSES_STORAGE_KEY,
  readClassTemplatesFromStorage,
  readScheduleClassesFromStorage,
  writeClassTemplatesToStorage,
  writeScheduleClassesToStorage,
} from '../scheduleStorage';

const createLocalStorageMock = () => {
  const store = new Map();

  return {
    getItem: vi.fn((key) => (store.has(key) ? store.get(key) : null)),
    setItem: vi.fn((key, value) => {
      store.set(key, String(value));
    }),
    removeItem: vi.fn((key) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    }),
  };
};

describe('scheduleStorage', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createLocalStorageMock());
    vi.restoreAllMocks();
  });

  it('reads schedule classes from storage', () => {
    localStorage.setItem(SCHEDULE_CLASSES_STORAGE_KEY, JSON.stringify([{ id: 1 }]));

    expect(readScheduleClassesFromStorage()).toEqual([{ id: 1 }]);
  });

  it('falls back to empty array for invalid schedule classes data', () => {
    localStorage.setItem(SCHEDULE_CLASSES_STORAGE_KEY, JSON.stringify({ id: 1 }));

    expect(readScheduleClassesFromStorage()).toEqual([]);
  });

  it('writes schedule classes and emits an update event', () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

    writeScheduleClassesToStorage([{ id: 2 }]);

    expect(localStorage.getItem(SCHEDULE_CLASSES_STORAGE_KEY)).toBe(JSON.stringify([{ id: 2 }]));
    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(dispatchSpy.mock.calls[0][0]).toBeInstanceOf(Event);
  });

  it('reads class templates from storage', () => {
    localStorage.setItem(CLASS_TEMPLATES_STORAGE_KEY, JSON.stringify([{ id: 3 }]));

    expect(readClassTemplatesFromStorage()).toEqual([{ id: 3 }]);
  });

  it('writes class templates to storage', () => {
    writeClassTemplatesToStorage([{ id: 4 }]);

    expect(localStorage.getItem(CLASS_TEMPLATES_STORAGE_KEY)).toBe(JSON.stringify([{ id: 4 }]));
  });
});
