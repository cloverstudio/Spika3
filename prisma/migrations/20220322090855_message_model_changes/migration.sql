/*
  Warnings:

  - You are about to drop the column `message_body` on the `message_device` table. All the data in the column will be lost.
  - Added the required column `total_user_count` to the `message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `body` to the `message_device` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `message` ADD COLUMN `total_user_count` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `message_device` DROP COLUMN `message_body`,
    ADD COLUMN `body` JSON NOT NULL;
