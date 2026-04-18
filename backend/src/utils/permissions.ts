export const USER_ROLES = {
  ADMIN: 1,
  TEACHER: 2,
  STUDENT: 3,
  PARENT: 4,
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];