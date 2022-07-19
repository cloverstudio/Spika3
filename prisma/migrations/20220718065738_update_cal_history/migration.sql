/*
  Warnings:

  - You are about to drop the column `audio_producer_id` on the `call_history` table. All the data in the column will be lost.
  - You are about to drop the column `video_producer_id` on the `call_history` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `call_history` DROP COLUMN `audio_producer_id`,
    DROP COLUMN `video_producer_id`;
