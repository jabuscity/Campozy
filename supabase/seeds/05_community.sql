ALTER TABLE discussions DISABLE TRIGGER trg_discussion_score;
ALTER TABLE discussion_replies DISABLE TRIGGER trg_reply_score;
ALTER TABLE property_reviews DISABLE TRIGGER trigger_recalculate_property_score;
ALTER TABLE neighborhood_reviews DISABLE TRIGGER trg_neighborhood_review_score;

WITH u AS (SELECT id FROM profiles ORDER BY created_at LIMIT 25), c AS (SELECT id FROM campuses LIMIT 10), dc AS (SELECT id FROM discussion_categories LIMIT 10)
INSERT INTO discussions (campus_id, user_id, category_id, title, content)
SELECT (SELECT id FROM c OFFSET floor(random()*10) LIMIT 1), (SELECT id FROM u OFFSET floor(random()*25) LIMIT 1), (SELECT id FROM dc OFFSET floor(random()*10) LIMIT 1),
  ('{Best quiet study spots?,Water supply issues,Looking for a roommate,Weekend events,Career fair next month,Tips for first-years,Campus security needed,Affordable hostels near Kasarani,Internet issues in Madaraka,Best cafes near campus}'::text[])[floor(random()*10+1)],
  'Has anyone else experienced this? Looking for advice from fellow students.'
FROM generate_series(1, 30) ON CONFLICT DO NOTHING;

WITH u AS (SELECT id FROM profiles ORDER BY created_at LIMIT 25), d AS (SELECT id FROM discussions)
INSERT INTO discussion_replies (discussion_id, user_id, content)
SELECT (SELECT id FROM d OFFSET floor(random()*30) LIMIT 1), (SELECT id FROM u OFFSET floor(random()*25) LIMIT 1),
  ('{Great point!,Same here.,Thanks for sharing.,I agree with this.}'::text[])[floor(random()*4+1)]
FROM generate_series(1, 80) ON CONFLICT DO NOTHING;

UPDATE discussions SET reply_count = (SELECT count(*) FROM discussion_replies WHERE discussion_id = discussions.id);

WITH u AS (SELECT id FROM profiles ORDER BY created_at LIMIT 25), c AS (SELECT id FROM campuses LIMIT 5)
INSERT INTO community_posts (author_id, campus_id, title, content)
SELECT (SELECT id FROM u OFFSET floor(random()*25) LIMIT 1), (SELECT id FROM c OFFSET floor(random()*5) LIMIT 1),
  ('{Student Life Tips,Housing Advice,Campus Update,Weekend Plans}'::text[])[floor(random()*4+1)],
  ('{Check this out!,Important update.,Does anyone have recommendations?,Sharing my experience...}'::text[])[floor(random()*4+1)]
FROM generate_series(1, 25) ON CONFLICT DO NOTHING;

WITH u AS (SELECT id FROM profiles ORDER BY created_at LIMIT 25), cp AS (SELECT id FROM community_posts)
INSERT INTO community_comments (post_id, author_id, content)
SELECT (SELECT id FROM cp OFFSET floor(random()*25) LIMIT 1), (SELECT id FROM u OFFSET floor(random()*25) LIMIT 1),
  ('{Great post!,Very helpful.,Thanks for sharing.}'::text[])[floor(random()*3+1)]
FROM generate_series(1, 60) ON CONFLICT DO NOTHING;

WITH u AS (SELECT id FROM profiles ORDER BY created_at LIMIT 25), cp AS (SELECT id FROM community_posts)
INSERT INTO community_likes (post_id, user_id)
SELECT (SELECT id FROM cp OFFSET floor(random()*25) LIMIT 1), (SELECT id FROM u OFFSET floor(random()*25) LIMIT 1)
FROM generate_series(1, 100) ON CONFLICT DO NOTHING;

ALTER TABLE discussions ENABLE TRIGGER trg_discussion_score;
ALTER TABLE discussion_replies ENABLE TRIGGER trg_reply_score;
ALTER TABLE property_reviews ENABLE TRIGGER trigger_recalculate_property_score;
ALTER TABLE neighborhood_reviews ENABLE TRIGGER trg_neighborhood_review_score;

SELECT count(*) AS discussions FROM discussions;
SELECT count(*) AS replies FROM discussion_replies;
SELECT count(*) AS community_posts FROM community_posts;
