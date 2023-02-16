-- AlterTable
ALTER TABLE `room` ADD COLUMN `avatar_file_id` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `avatar_file_id` INTEGER NOT NULL DEFAULT 0;
