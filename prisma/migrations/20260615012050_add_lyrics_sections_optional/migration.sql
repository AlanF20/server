/*
  Warnings:

  - Added the required column `lyrics` to the `Song` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Song" ADD COLUMN     "lyrics" TEXT NOT NULL,
ALTER COLUMN "sections" DROP NOT NULL;
