/*
  Warnings:

  - You are about to drop the column `avatar_url` on the `room` table. All the data in the column will be lost.
  - You are about to drop the column `avatar_url` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `room` DROP COLUMN `avatar_url`;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `avatar_url`;
