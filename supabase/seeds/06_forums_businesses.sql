WITH u AS (SELECT id FROM profiles ORDER BY created_at LIMIT 25),
c AS (SELECT id FROM campuses LIMIT 10)

-- FORUMS
INSERT INTO forums (name, description, campus_id, neighborhood_id, is_public, created_by)
SELECT ('{UoN Students Hub,JKUAT Campus Connect,Strathmore Life,KU Community,General Nairobi Student Life}'::text[])[floor(random()*5+1)],
  'Campus forum for students',
  (SELECT id FROM c OFFSET floor(random()*10) LIMIT 1),
  NULL, true,
  (SELECT id FROM u OFFSET floor(random()*25) LIMIT 1)
FROM generate_series(1, 5)
ON CONFLICT DO NOTHING;

-- FORUM TOPICS
WITH f AS (SELECT id FROM forums), u AS (SELECT id FROM profiles ORDER BY created_at LIMIT 25)
INSERT INTO forum_topics (forum_id, user_id, title, content, is_pinned, view_count, reply_count)
SELECT (SELECT id FROM f OFFSET floor(random()*5) LIMIT 1),
  (SELECT id FROM u OFFSET floor(random()*25) LIMIT 1),
  ('{Welcome to the forum!,Study tips needed,Housing discussion,Weekend events,Campus news}'::text[])[floor(random()*5+1)],
  'What do you think about this? Let us discuss.',
  random() > 0.8, floor(random()*500), floor(random()*20)
FROM generate_series(1, 25)
ON CONFLICT DO NOTHING;

-- FORUM POSTS
WITH ft AS (SELECT id FROM forum_topics), u AS (SELECT id FROM profiles ORDER BY created_at LIMIT 25)
INSERT INTO forum_posts (topic_id, user_id, content)
SELECT (SELECT id FROM ft OFFSET floor(random()*25) LIMIT 1),
  (SELECT id FROM u OFFSET floor(random()*25) LIMIT 1),
  ('{Great point!,I agree fully.,Interesting perspective.,Thanks for posting this.}'::text[])[floor(random()*4+1)]
FROM generate_series(1, 100)
ON CONFLICT DO NOTHING;

-- BUSINESSES
WITH u AS (SELECT id FROM profiles ORDER BY created_at LIMIT 25), n AS (SELECT id FROM neighborhoods LIMIT 10)
INSERT INTO businesses (owner_id, neighborhood_id, name, description, category, verification_level, campozy_score, address, phone, is_active)
SELECT (SELECT id FROM u OFFSET floor(random()*25) LIMIT 1),
  (SELECT id FROM n OFFSET floor(random()*10) LIMIT 1),
  ('{Kafeeres Kitchen,Westlands Cafe,JKUAT Student Shop,UoN Bookshop,Nairobi Cyber Cafe,Madaraka Salon,Juja Pharmacy,Kasarani Laundry}'::text[])[floor(random()*8+1)],
  'Popular business near campus',
  ('{Restaurant,Cafe,Pharmacy,Supermarket,Salon,Laundry,Print Shop,Cyber Cafe}'::text[])[floor(random()*8+1)],
  ('{unverified,claimed,community_verified,scout_verified,campozy_verified}'::text[])[floor(random()*5+1)]::verification_level,
  floor(random()*60+40),
  floor(random()*200+1)::text || ' Nairobi Road', '+2547' || floor(random()*90000000+10000000)::text, true
FROM generate_series(1, 15)
ON CONFLICT DO NOTHING;

-- BUSINESS REVIEWS
WITH b AS (SELECT id FROM businesses), u AS (SELECT id FROM profiles ORDER BY created_at LIMIT 25)
INSERT INTO business_reviews (business_id, reviewer_id, overall_rating, service_rating, quality_rating, value_rating, cleanliness_rating, staff_rating, title, review, would_recommend, is_verified_visit)
SELECT (SELECT id FROM b OFFSET floor(random()*15) LIMIT 1),
  (SELECT id FROM u OFFSET floor(random()*25) LIMIT 1),
  floor(random()*3+3), floor(random()*3+3), floor(random()*3+3), floor(random()*3+3), floor(random()*3+3), floor(random()*3+3),
  ('{Great service!,Average experience,Highly recommend,Disappointing}'::text[])[floor(random()*4+1)],
  'Good service. Perfect for students.',
  random() > 0.2, random() > 0.3
FROM generate_series(1, 60)
ON CONFLICT DO NOTHING;

SELECT count(*) AS forums FROM forums;
SELECT count(*) AS forum_topics FROM forum_topics;
SELECT count(*) AS forum_posts FROM forum_posts;
SELECT count(*) AS businesses FROM businesses;
SELECT count(*) AS business_reviews FROM business_reviews;
