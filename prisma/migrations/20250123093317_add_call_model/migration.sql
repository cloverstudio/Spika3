-- CreateTable
CREATE TABLE `call` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `room_id` INTEGER NOT NULL,
    `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `finished_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `call_participant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `call_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `is_initiator` BOOLEAN NOT NULL DEFAULT false,
    `joined_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `left_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `call` ADD CONSTRAINT `call_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `room`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `call_participant` ADD CONSTRAINT `call_participant_call_id_fkey` FOREIGN KEY (`call_id`) REFERENCES `call`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `call_participant` ADD CONSTRAINT `call_participant_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
