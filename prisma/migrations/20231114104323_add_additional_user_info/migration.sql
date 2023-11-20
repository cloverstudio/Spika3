-- AlterTable
ALTER TABLE `user` ADD COLUMN `cover_file_id` INTEGER NULL,
    ADD COLUMN `long_description` VARCHAR(191) NULL,
    ADD COLUMN `short_description` VARCHAR(191) NULL;
