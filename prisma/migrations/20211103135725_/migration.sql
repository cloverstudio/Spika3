/*
  Warnings:

  - Added the required column `contactId` to the `contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `contact` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `contact` ADD COLUMN `contactId` INTEGER NOT NULL,
    ADD COLUMN `userId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `contact` ADD CONSTRAINT `contact_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contact` ADD CONSTRAINT `contact_contactId_fkey` FOREIGN KEY (`contactId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
