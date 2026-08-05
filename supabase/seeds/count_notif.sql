SELECT 'notifications' AS tbl, count(*) AS cnt FROM notifications UNION ALL
SELECT 'events', count(*) FROM events UNION ALL
SELECT 'utility_incidents', count(*) FROM utility_incidents UNION ALL
SELECT 'hygiene_reports', count(*) FROM hygiene_reports UNION ALL
SELECT 'neighborhood_reviews', count(*) FROM neighborhood_reviews;
