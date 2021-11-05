/*
  Warnings:

  - You are about to alter the column `os_version` on the `device` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - Made the column `user_id` on table `device` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `device` MODIFY `user_id` INTEGER NOT NULL,
    MODIFY `os_version` INTEGER,
    MODIFY `app_version` INTEGER,
    MODIFY `token_expired_at` DATETIME(3);

-- AddForeignKey
ALTER TABLE `device` ADD CONSTRAINT `device_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
