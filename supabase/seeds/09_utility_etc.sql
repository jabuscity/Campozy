WITH p AS (SELECT id FROM properties WHERE is_active = true LIMIT 25),
u AS (SELECT id FROM profiles ORDER BY created_at LIMIT 25),
ut AS (SELECT id FROM utility_types)

INSERT INTO utility_incidents (property_id, utility_type_id, reported_by, description, severity, resolved_at)
SELECT (SELECT id FROM p OFFSET floor(random()*25) LIMIT 1),
  (SELECT id FROM ut OFFSET floor(random()*6) LIMIT 1),
  (SELECT id FROM u OFFSET floor(random()*25) LIMIT 1),
  ('{kplc outage reported in the area.,water shortage affecting students.,internet connectivity issues.,sewage blockage reported.,power outage in the neighborhood.}'::text[])[floor(random()*5+1)],
  ('{low,medium,high}'::text[])[floor(random()*3+1)],
  CASE WHEN random() > 0.5 THEN NOW() - (random() * interval '7 days') ELSE NULL END
FROM generate_series(1, 20)
ON CONFLICT DO NOTHING;

WITH p AS (SELECT id FROM properties WHERE is_active = true LIMIT 25),
u AS (SELECT id FROM profiles ORDER BY created_at LIMIT 25),
hc AS (SELECT id FROM hygiene_categories)

INSERT INTO hygiene_reports (property_id, user_id, category_id, score, comment)
SELECT (SELECT id FROM p OFFSET floor(random()*25) LIMIT 1),
  (SELECT id FROM u OFFSET floor(random()*25) LIMIT 1),
  (SELECT id FROM hc OFFSET floor(random()*6) LIMIT 1),
  floor(random()*5+1),
  ('{clean,could be better,needs improvement,well maintained,average}'::text[])[floor(random()*5+1)]
FROM generate_series(1, 30)
ON CONFLICT DO NOTHING;

WITH n AS (SELECT id FROM neighborhoods LIMIT 10),
u AS (SELECT id FROM profiles ORDER BY created_at LIMIT 25)

INSERT INTO neighborhood_reviews (neighborhood_id, user_id, rating, content, safety_rating, transport_rating, amenities_rating)
SELECT (SELECT id FROM n OFFSET floor(random()*10) LIMIT 1),
  (SELECT id FROM u OFFSET floor(random()*25) LIMIT 1),
  floor(random()*3+3),
  ('{great neighborhood for students.,good transport links.,affordable and peaceful.,nice area but far from campus.}'::text[])[floor(random()*4+1)],
  floor(random()*3+3), floor(random()*3+3), floor(random()*3+3)
FROM generate_series(1, 20)
ON CONFLICT DO NOTHING;
