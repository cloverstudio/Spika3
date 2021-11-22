-- AlterTable
ALTER TABLE `room` ADD COLUMN `deleted` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `room_user` MODIFY `is_admin` BOOLEAN NOT NULL DEFAULT false;
