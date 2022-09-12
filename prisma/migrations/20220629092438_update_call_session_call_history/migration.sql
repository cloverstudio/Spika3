/*
  Warnings:

  - Added the required column `call_session` to the `call_history` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `call_history` ADD COLUMN `call_session` INTEGER NOT NULL;
