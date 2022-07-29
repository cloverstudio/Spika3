-- AlterTable
ALTER TABLE `call_history` ALTER COLUMN `left_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `call_session` ALTER COLUMN `finished_at` DROP DEFAULT;
