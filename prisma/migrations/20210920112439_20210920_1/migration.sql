/*
  Warnings:

  - You are about to drop the column `dispayName` on the `UserAccounts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `UserAccounts` DROP COLUMN `dispayName`,
    ADD COLUMN `avatarUrl` VARCHAR(191),
    ADD COLUMN `displayName` VARCHAR(191),
    MODIFY `email` VARCHAR(191);
