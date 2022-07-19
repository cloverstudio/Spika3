-- AlterTable
ALTER TABLE `call_history` ADD COLUMN `callParameters` JSON NULL;

-- AddForeignKey
ALTER TABLE `call_history` ADD CONSTRAINT `call_history_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `call_history` ADD CONSTRAINT `call_history_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `room`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
