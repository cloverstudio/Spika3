/*
  Warnings:

  - You are about to drop the column `avatar_url` on the `api_key` table. All the data in the column will be lost.
  - You are about to drop the column `display_name` on the `api_key` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `api_key` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `api_key` DROP COLUMN `avatar_url`,
    DROP COLUMN `display_name`,
    ADD COLUMN `user_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `is_bot` BOOLEAN NOT NULL DEFAULT false;
