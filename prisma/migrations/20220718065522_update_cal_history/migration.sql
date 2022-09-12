-- AlterTable
ALTER TABLE `call_history` ADD COLUMN `audio_producer_id` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `video_producer_id` VARCHAR(191) NOT NULL DEFAULT '';
