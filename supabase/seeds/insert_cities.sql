INSERT INTO cities (country_id, name)
SELECT id, 'Nairobi' FROM countries WHERE code = 'KE'
ON CONFLICT (country_id, name) DO NOTHING;

INSERT INTO cities (country_id, name)
SELECT id, 'Thika' FROM countries WHERE code = 'KE'
ON CONFLICT (country_id, name) DO NOTHING;

SELECT count(*) AS city_count FROM cities;
