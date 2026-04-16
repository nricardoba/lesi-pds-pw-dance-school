/*
  Warnings:

  - Changed the type of `class_date_end` on the `Class` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `class_date_start` on the `Class` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `schedule_vacancy_start` on the `Schedule_Vacancy` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `schedule_vacancy_end` on the `Schedule_Vacancy` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Class" DROP COLUMN "class_date_end",
ADD COLUMN     "class_date_end" TIMESTAMPTZ(6) NOT NULL,
DROP COLUMN "class_date_start",
ADD COLUMN     "class_date_start" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "Schedule_Vacancy" DROP COLUMN "schedule_vacancy_start",
ADD COLUMN     "schedule_vacancy_start" TIMESTAMPTZ(6) NOT NULL,
DROP COLUMN "schedule_vacancy_end",
ADD COLUMN     "schedule_vacancy_end" TIMESTAMPTZ(6) NOT NULL;
