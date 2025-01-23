/*
  Warnings:

  - A unique constraint covering the columns `[call_id,user_id]` on the table `call_participant` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `call_participant_call_id_user_id_key` ON `call_participant`(`call_id`, `user_id`);
