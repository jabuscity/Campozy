WITH u AS (SELECT id FROM profiles ORDER BY created_at LIMIT 25),
c AS (SELECT id FROM campuses LIMIT 10),
p AS (SELECT id FROM properties WHERE is_active = true LIMIT 25),
ut AS (SELECT id FROM utility_types LIMIT 6),
hc AS (SELECT id FROM hygiene_categories LIMIT 5),
n AS (SELECT id FROM neighborhoods LIMIT 10)

-- NOTIFICATIONS
INSERT INTO notifications (user_id, type, title, content, link, is_read)
SELECT (SELECT id FROM u OFFSET floor(random()*25) LIMIT 1),
  ('{message,review,opportunity,system,verification,alert}'::notification_type[])[floor(random()*6+1)],
  ('{New message received,Property review update,New opportunity posted,System notification,Verification complete}'::text[])[floor(random()*5+1)],
  'You have a new notification on Campozy.', '/dashboard', random() > 0.5
FROM generate_series(1, 30)
ON CONFLICT DO NOTHING;

-- EVENTS
INSERT INTO events (title, description, event_type, location, start_time, end_time, campus_id, organizer_id, max_attendees, is_public)
SELECT ('{Campus Career Fair,Student Orientation,Sports Day,Tech Talk,Networking Night}'::text[])[floor(random()*5+1)],
  'Join us for this exciting campus event.',
  ('{academic,social,sports,career,cultural}'::text[])[floor(random()*5+1)],
  ('{Main Hall,Sports Field,Auditorium,Online,Campus Grounds}'::text[])[floor(random()*5+1)],
  NOW() + (random() * interval '30 days'),
  NOW() + (random() * interval '30 days') + interval '2 hours',
  (SELECT id FROM c OFFSET floor(random()*10) LIMIT 1),
  (SELECT id FROM u OFFSET floor(random()*25) LIMIT 1),
  floor(random()*450+50), true
FROM generate_series(1, 15)
ON CONFLICT DO NOTHING;

-- UTILITY INCIDENTS
INSERT INTO utility_incidents (property_id, utility_type_id, reported_by, title, description, severity, location_type, location_description, resolved_at)
SELECT (SELECT id FROM p OFFSET floor(random()*25) LIMIT 1),
  (SELECT id FROM ut OFFSET floor(random()*6) LIMIT 1),
  (SELECT id FROM u OFFSET floor(random()*25) LIMIT 1),
  ('{KPLC Outage,Water Shortage,Internet Down,Sewage Blockage,No Power,Low Water Pressure}'::text[])[floor(random()*6+1)],
  'Reported by a student in the area.',
  ('{low,medium,high}'::text[])[floor(random()*3+1)],
  'property',
  ('{Madaraka Estate,Westlands,Juja,Kasarani,Parklands,Kilimani}'::text[])[floor(random()*6+1)],
  CASE WHEN random() > 0.5 THEN NOW() - (random() * interval '7 days') ELSE NULL END
FROM generate_series(1, 20)
ON CONFLICT DO NOTHING;

-- HYGIENE REPORTS
INSERT INTO hygiene_reports (property_id, user_id, category_id, score, comment)
SELECT (SELECT id FROM p OFFSET floor(random()*25) LIMIT 1),
  (SELECT id FROM u OFFSET floor(random()*25) LIMIT 1),
  (SELECT id FROM hc OFFSET floor(random()*5) LIMIT 1),
  floor(random()*5+1),
  ('{Clean,Could be better,Needs improvement,Well maintained,Average}'::text[])[floor(random()*5+1)]
FROM generate_series(1, 30)
ON CONFLICT DO NOTHING;

-- NEIGHBORHOOD REVIEWS
INSERT INTO neighborhood_reviews (neighborhood_id, user_id, rating, content, safety_rating, transport_rating, amenities_rating)
SELECT (SELECT id FROM n OFFSET floor(random()*10) LIMIT 1),
  (SELECT id FROM u OFFSET floor(random()*25) LIMIT 1),
  floor(random()*3+3),
  ('{Great neighborhood for students.,Good transport links.,Affordable and peaceful.,Nice area but far from campus.}'::text[])[floor(random()*4+1)],
  floor(random()*3+3), floor(random()*3+3), floor(random()*3+3)
FROM generate_series(1, 20)
ON CONFLICT DO NOTHING;

SELECT count(*) AS notifications FROM notifications;
SELECT count(*) AS events FROM events;
SELECT count(*) AS utility_incidents FROM utility_incidents;
SELECT count(*) AS hygiene_reports FROM hygiene_reports;
SELECT count(*) AS neighborhood_reviews FROM neighborhood_reviews;
