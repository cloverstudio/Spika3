/*
  Warnings:

  - Added the required column `device_id` to the `message_device` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `message` MODIFY `seen_count` INTEGER NOT NULL DEFAULT 0,
    MODIFY `received_count` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `message_device` ADD COLUMN `device_id` INTEGER NOT NULL;
