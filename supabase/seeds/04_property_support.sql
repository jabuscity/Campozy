WITH p AS (SELECT id FROM properties WHERE is_active = true ORDER BY created_at), u AS (SELECT id FROM profiles ORDER BY created_at LIMIT 25), amen AS (SELECT id FROM amenities), util AS (SELECT id FROM utilities)
INSERT INTO property_rooms (property_id, room_type, quantity)
SELECT (SELECT id FROM p OFFSET floor(random() * 25) LIMIT 1), ('{Single,Double,Triple,Self-contained,Bedsitter}'::text[])[floor(random()*5+1)], floor(random()*10+1)
FROM generate_series(1, 100) ON CONFLICT DO NOTHING;

WITH p AS (SELECT id FROM properties WHERE is_active = true ORDER BY created_at)
INSERT INTO property_media (property_id, url, media_type, is_primary)
SELECT (SELECT id FROM p OFFSET floor(random() * 25) LIMIT 1), 'https://images.unsplash.com/photo-' || ('{1522708323590-d24dbb6b0267,1560518883-ce09059eeffa,1502672260266-1c1ef2d93688,1493809842364-b788880f84be,1560448204-e02f11c3d0e2,1560185007-cde436f6f4be,1522771739844-6a9f6d5f43d6,1512917772890-aee59a4d1a3c,1505693416388-ac5ce068fe85,1600585154520-3ae6c3a93289}'::text[])[floor(random()*10+1)] || '?auto=format&fit=crop&q=80&w=800', 'image', random() > 0.3
FROM generate_series(1, 80) ON CONFLICT DO NOTHING;

WITH p AS (SELECT id FROM properties WHERE is_active = true ORDER BY created_at), amen AS (SELECT id FROM amenities)
INSERT INTO property_amenities (property_id, amenity_id)
SELECT (SELECT id FROM p OFFSET floor(random() * 25) LIMIT 1), (SELECT id FROM amen OFFSET floor(random() * (SELECT count(*) FROM amen)) LIMIT 1)
FROM generate_series(1, 120) ON CONFLICT DO NOTHING;

WITH p AS (SELECT id FROM properties WHERE is_active = true ORDER BY created_at), util AS (SELECT id FROM utilities ORDER BY name)
INSERT INTO property_utilities (property_id, utility_id, reliability_score)
SELECT (SELECT id FROM p), (SELECT id FROM util OFFSET floor(random() * (SELECT count(*) FROM util)) LIMIT 1), floor(random() * 50 + 50)
FROM p ON CONFLICT DO NOTHING;

WITH p AS (SELECT id FROM properties WHERE is_active = true ORDER BY created_at), u AS (SELECT id FROM profiles ORDER BY created_at LIMIT 25)
INSERT INTO property_reviews (property_id, reviewer_id, overall_rating, safety_rating, hygiene_rating, water_rating, electricity_rating, internet_rating, management_rating, accessibility_rating, value_for_money_rating, content)
SELECT (SELECT id FROM p OFFSET floor(random() * 25) LIMIT 1), (SELECT id FROM u OFFSET floor(random() * 25) LIMIT 1), floor(random()*3+3), floor(random()*3+3), floor(random()*3+3), floor(random()*3+3), floor(random()*3+3), floor(random()*3+3), floor(random()*3+3), floor(random()*3+3), floor(random()*3+3), ('{Great place to stay!,Management is responsive.,Good value for money.,Water issues sometimes but overall good.,Excellent internet and study environment.,Highly recommended for students.,Peaceful and conducive for studies.}'::text[])[floor(random()*7+1)]
FROM generate_series(1, 80) ON CONFLICT DO NOTHING;

WITH p AS (SELECT id FROM properties WHERE is_active = true ORDER BY created_at), u AS (SELECT id FROM profiles ORDER BY created_at LIMIT 25)
INSERT INTO saved_properties (user_id, property_id, notes, saved_at)
SELECT (SELECT id FROM u OFFSET floor(random() * 25) LIMIT 1), (SELECT id FROM p OFFSET floor(random() * 25) LIMIT 1), ('{Interested,Maybe later,Good option}'::text[])[floor(random()*3+1)], NOW() - (random() * interval '30 days')
FROM generate_series(1, 60) ON CONFLICT DO NOTHING;

WITH p AS (SELECT id FROM properties WHERE is_active = true ORDER BY created_at), u AS (SELECT id FROM profiles ORDER BY created_at LIMIT 25)
INSERT INTO property_inquiries (property_id, sender_id, message, status)
SELECT (SELECT id FROM p OFFSET floor(random() * 25) LIMIT 1), (SELECT id FROM u OFFSET floor(random() * 25) LIMIT 1), 'I am interested.', ('{open,responded,closed}'::text[])[floor(random()*3+1)]
FROM generate_series(1, 40) ON CONFLICT DO NOTHING;

WITH p AS (SELECT id FROM properties WHERE is_active = true ORDER BY created_at), u AS (SELECT id FROM profiles ORDER BY created_at LIMIT 25)
INSERT INTO viewing_requests (property_id, requester_id, requested_time, status)
SELECT (SELECT id FROM p OFFSET floor(random() * 25) LIMIT 1), (SELECT id FROM u OFFSET floor(random() * 25) LIMIT 1), NOW() + (random() * interval '30 days'), ('{pending,approved,rejected,completed}'::text[])[floor(random()*4+1)]
FROM generate_series(1, 30) ON CONFLICT DO NOTHING;
