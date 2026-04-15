/*
  Warnings:

  - You are about to drop the column `class_day` on the `Class` table. All the data in the column will be lost.
  - You are about to drop the column `class_time_end` on the `Class` table. All the data in the column will be lost.
  - You are about to drop the column `class_time_start` on the `Class` table. All the data in the column will be lost.
  - You are about to drop the column `schedule_vacancy_day` on the `Schedule_Vacancy` table. All the data in the column will be lost.
  - Added the required column `class_date_end` to the `Class` table without a default value. This is not possible if the table is not empty.
  - Added the required column `class_date_start` to the `Class` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Class" DROP COLUMN "class_day",
DROP COLUMN "class_time_end",
DROP COLUMN "class_time_start",
ADD COLUMN     "class_date_end" TIME(6) NOT NULL,
ADD COLUMN     "class_date_start" TIME(6) NOT NULL;

-- AlterTable
ALTER TABLE "Schedule_Vacancy" DROP COLUMN "schedule_vacancy_day";
