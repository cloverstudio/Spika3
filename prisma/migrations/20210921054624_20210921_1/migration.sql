/*
  Warnings:

  - You are about to drop the `UserAccounts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `UserAccounts`;

-- CreateTable
CREATE TABLE `UserAccount` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191),
    `displayName` VARCHAR(191),
    `password` VARCHAR(191) NOT NULL,
    `loginName` VARCHAR(191) NOT NULL,
    `avatarUrl` VARCHAR(191),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifiedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `UserAccount_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
