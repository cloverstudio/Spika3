/*
  Warnings:

  - You are about to drop the column `received_count` on the `message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `message` DROP COLUMN `received_count`,
    ADD COLUMN `delivered_count` INTEGER NOT NULL DEFAULT 0;
