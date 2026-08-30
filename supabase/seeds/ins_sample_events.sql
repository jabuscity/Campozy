-- ============================================
-- Two Detailed Sample Events for Visual Analysis
-- ============================================

INSERT INTO events (title, description, event_type, location, start_time, end_time, campus_id, organizer_id, max_attendees, is_public)
SELECT 
  'Campus Tech Hackathon 2025',
  'Join us for an exciting 24-hour hackathon where students from all universities come together to build innovative solutions for campus life. Whether you are a developer, designer, or just curious, there is a place for you. Prizes include cash awards, internship opportunities, and tech gadgets.',
  'tech',
  'University of Nairobi - Main Campus, Innovation Hub',
  NOW() + interval '12 days',
  NOW() + interval '13 days',
  c.id,
  '752f3dd3-4cee-4124-8d49-2fc322fed16c',
  150,
  true
FROM campuses c
JOIN universities u ON c.university_id = u.id
WHERE u.name = 'University of Nairobi'
LIMIT 1;

INSERT INTO events (title, description, event_type, location, start_time, end_time, campus_id, organizer_id, max_attendees, is_public)
SELECT 
  'Student Networking Night: Connect & Collaborate',
  'An evening of speed networking, cold drinks, and real connections. Meet fellow students, scouts, and employers across East Africa. Perfect for anyone looking for internships, roommates, or just new friends. Dress code: smart casual.',
  'social',
  'Strathmore University - Madaraka Campus, Student Lounge',
  NOW() + interval '5 days',
  NOW() + interval '5 days 6 hours',
  c.id,
  '723d8ccd-c563-4439-bd7f-88df061da74e',
  80,
  true
FROM campuses c
JOIN universities u ON c.university_id = u.id
WHERE u.name = 'Strathmore University'
LIMIT 1;

SELECT count(*) AS total_events FROM events;
