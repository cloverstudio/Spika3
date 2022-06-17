/*
  Warnings:

  - You are about to drop the column `string` on the `note` table. All the data in the column will be lost.
  - Added the required column `content` to the `note` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `note` DROP COLUMN `string`,
    ADD COLUMN `content` VARCHAR(191) NOT NULL,
    ADD COLUMN `title` VARCHAR(191) NOT NULL DEFAULT '';
