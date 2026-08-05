SELECT count(*) AS country_count, (SELECT code FROM countries LIMIT 1) AS sample_code FROM countries;
