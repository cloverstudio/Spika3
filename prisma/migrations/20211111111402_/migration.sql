/*
  Warnings:

  - A unique constraint covering the columns `[client_id]` on the table `file` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `client_id` to the `file` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `file` ADD COLUMN `client_id` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `file_client_id_key` ON `file`(`client_id`);
