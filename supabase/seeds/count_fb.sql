SELECT 'forums' AS tbl, count(*) AS cnt FROM forums UNION ALL
SELECT 'forum_topics', count(*) FROM forum_topics UNION ALL
SELECT 'forum_posts', count(*) FROM forum_posts UNION ALL
SELECT 'businesses', count(*) FROM businesses UNION ALL
SELECT 'business_reviews', count(*) FROM business_reviews;
