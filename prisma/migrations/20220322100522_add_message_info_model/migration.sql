-- CreateTable
CREATE TABLE `message_info` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `message_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `string` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modified_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `message_info_message_id_user_id_string_key`(`message_id`, `user_id`, `string`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `message_info` ADD CONSTRAINT `message_info_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message_info` ADD CONSTRAINT `message_info_message_id_fkey` FOREIGN KEY (`message_id`) REFERENCES `message`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
