/*
  Warnings:

  - You are about to drop the column `loginName` on the `UserAccount` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `UserAccount` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[telephoneNumber]` on the table `UserAccount` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `telephoneNumber` to the `UserAccount` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `UserAccount` required. This step will fail if there are existing NULL values in that column.
  - Made the column `displayName` on table `UserAccount` required. This step will fail if there are existing NULL values in that column.
  - Made the column `avatarUrl` on table `UserAccount` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `UserAccount` DROP COLUMN `loginName`,
    DROP COLUMN `password`,
    ADD COLUMN `telephoneNumber` VARCHAR(191) NOT NULL,
    MODIFY `email` VARCHAR(191) NOT NULL,
    MODIFY `displayName` VARCHAR(191) NOT NULL,
    MODIFY `avatarUrl` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `UserAccount_telephoneNumber_key` ON `UserAccount`(`telephoneNumber`);
