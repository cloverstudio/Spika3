/*
  Warnings:

  - Added the required column `is_admin` to the `room_user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `room_user` ADD COLUMN `is_admin` BOOLEAN NOT NULL;
