INSERT INTO notifications (user_id, type, title, content, link, is_read)
SELECT id, 'message', 'New message received', 'You have a new notification.', '/dashboard', true
FROM profiles LIMIT 5;

INSERT INTO notifications (user_id, type, title, content, link, is_read)
SELECT id, 'opportunity', 'New opportunity posted', 'Check out this new opportunity.', '/opportunities', false
FROM profiles LIMIT 5;

INSERT INTO notifications (user_id, type, title, content, link, is_read)
SELECT id, 'system', 'System notification', 'Welcome to Campozy!', '/dashboard', false
FROM profiles LIMIT 5;

SELECT count(*) AS notifications FROM notifications;
