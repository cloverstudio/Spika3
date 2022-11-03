/*
  Warnings:

  - You are about to drop the column `key` on the `api_key` table. All the data in the column will be lost.
  - Added the required column `token` to the `api_key` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `api_key` DROP COLUMN `key`,
    ADD COLUMN `token` VARCHAR(191) NOT NULL;
