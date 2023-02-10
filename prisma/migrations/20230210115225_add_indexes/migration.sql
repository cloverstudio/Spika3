-- CreateIndex
CREATE INDEX `device_token_idx` ON `device`(`token`);

-- CreateIndex
CREATE INDEX `message_room_id_created_at_idx` ON `message`(`room_id`, `created_at` DESC);

-- CreateIndex
CREATE INDEX `message_device_device_id_user_id_message_id_idx` ON `message_device`(`device_id`, `user_id`, `message_id`);

-- CreateIndex
CREATE INDEX `user_display_name_idx` ON `user`(`display_name`);
