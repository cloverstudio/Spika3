-- CreateTable
CREATE TABLE `device` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER,
    `device_id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191),
    `os_name` VARCHAR(191),
    `os_version` VARCHAR(191) NOT NULL,
    `app_version` INTEGER NOT NULL,
    `token` VARCHAR(191),
    `push_token` VARCHAR(191),
    `token_expired_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modified_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `device_device_id_key`(`device_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
