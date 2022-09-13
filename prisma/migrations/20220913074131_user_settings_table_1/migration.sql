/*
  Warnings:

  - A unique constraint covering the columns `[user_id,key]` on the table `user_setting` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `user_setting_user_id_key_key` ON `user_setting`(`user_id`, `key`);
