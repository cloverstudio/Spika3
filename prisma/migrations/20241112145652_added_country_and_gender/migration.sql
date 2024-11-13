-- AlterTable
ALTER TABLE `user` ADD COLUMN `country` VARCHAR(191) NULL,
    ADD COLUMN `gender` ENUM('M', 'F', 'O') NULL;
