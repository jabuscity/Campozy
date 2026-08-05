SELECT 'utility_incidents' AS tbl, count(*) AS cnt FROM utility_incidents UNION ALL
SELECT 'hygiene_reports', count(*) FROM hygiene_reports UNION ALL
SELECT 'neighborhood_reviews', count(*) FROM neighborhood_reviews;
