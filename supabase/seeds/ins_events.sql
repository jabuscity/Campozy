INSERT INTO events (title, description, event_type, location, start_time, end_time, campus_id, organizer_id, max_attendees, is_public)
SELECT 'Campus Career Fair', 'Join us for this exciting campus event.', 'career', 'Main Hall', NOW() + interval '7 days', NOW() + interval '9 hours', id, id, 200, true
FROM campuses LIMIT 3;

INSERT INTO events (title, description, event_type, location, start_time, end_time, campus_id, organizer_id, max_attendees, is_public)
SELECT 'Student Orientation', 'Welcome new students.', 'academic', 'Auditorium', NOW() + interval '14 days', NOW() + interval '5 hours', id, id, 300, true
FROM campuses LIMIT 3;

INSERT INTO events (title, description, event_type, location, start_time, end_time, campus_id, organizer_id, max_attendees, is_public)
SELECT 'Sports Day', 'Annual sports competition.', 'sports', 'Sports Field', NOW() + interval '21 days', NOW() + interval '8 hours', id, id, 500, true
FROM campuses LIMIT 3;

INSERT INTO events (title, description, event_type, location, start_time, end_time, campus_id, organizer_id, max_attendees, is_public)
SELECT 'Tech Talk', 'Learn about the latest tech trends.', 'academic', 'Online', NOW() + interval '10 days', NOW() + interval '3 hours', id, id, 100, true
FROM campuses LIMIT 3;

INSERT INTO events (title, description, event_type, location, start_time, end_time, campus_id, organizer_id, max_attendees, is_public)
SELECT 'Networking Night', 'Connect with professionals.', 'social', 'Campus Grounds', NOW() + interval '5 days', NOW() + interval '4 hours', id, id, 150, true
FROM campuses LIMIT 3;

SELECT count(*) AS events FROM events;
