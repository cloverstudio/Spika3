/*
  Warnings:

  - You are about to drop the `message_info` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `message_info` DROP FOREIGN KEY `message_info_message_id_fkey`;

-- DropForeignKey
ALTER TABLE `message_info` DROP FOREIGN KEY `message_info_user_id_fkey`;

-- DropTable
DROP TABLE `message_info`;

-- CreateTable
CREATE TABLE `message_record` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `message_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `string` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modified_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `message_record_message_id_user_id_string_key`(`message_id`, `user_id`, `string`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `message_record` ADD CONSTRAINT `message_record_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message_record` ADD CONSTRAINT `message_record_message_id_fkey` FOREIGN KEY (`message_id`) REFERENCES `message`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
