/*
  Warnings:

  - A unique constraint covering the columns `[telephone_number_hashed]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `telephone_number_hashed` VARCHAR(191);

-- CreateIndex
CREATE UNIQUE INDEX `user_telephone_number_hashed_key` ON `user`(`telephone_number_hashed`);
