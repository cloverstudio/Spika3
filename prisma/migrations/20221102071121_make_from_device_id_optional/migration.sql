-- DropForeignKey
ALTER TABLE `message` DROP FOREIGN KEY `message_from_device_id_fkey`;

-- AlterTable
ALTER TABLE `message` MODIFY `from_device_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `message_device` MODIFY `from_device_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `message` ADD CONSTRAINT `message_from_device_id_fkey` FOREIGN KEY (`from_device_id`) REFERENCES `device`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
