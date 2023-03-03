/*
  Warnings:

  - You are about to alter the column `size` on the `file` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `file` MODIFY `size` DOUBLE NOT NULL;
