/*
  Warnings:

  - You are about to drop the column `otp` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `otp`,
    ADD COLUMN `verification_code` VARCHAR(191);
