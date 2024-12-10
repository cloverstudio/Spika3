/*
  Warnings:

  - You are about to drop the column `is_public` on the `file` table. All the data in the column will be lost.
  - You are about to drop the `file_permissions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `file_permissions` DROP FOREIGN KEY `file_permissions_file_id_fkey`;

-- DropForeignKey
ALTER TABLE `file_permissions` DROP FOREIGN KEY `file_permissions_user_id_fkey`;

-- AlterTable
ALTER TABLE `file` DROP COLUMN `is_public`;

-- DropTable
DROP TABLE `file_permissions`;
