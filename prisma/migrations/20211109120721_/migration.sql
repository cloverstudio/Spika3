/*
  Warnings:

  - You are about to drop the column `relationId` on the `file` table. All the data in the column will be lost.
  - Added the required column `relation_id` to the `file` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `file` DROP COLUMN `relationId`,
    ADD COLUMN `relation_id` INTEGER NOT NULL;
