INSERT INTO privacy_settings (user_id, is_calling_muted)
SELECT id, false 
FROM user;