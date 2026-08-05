INSERT INTO cities (country_id, name)
SELECT id, 'Nairobi' FROM countries WHERE code = 'KE'
ON CONFLICT (country_id, name) DO NOTHING;

INSERT INTO cities (country_id, name)
SELECT id, 'Thika' FROM countries WHERE code = 'KE'
ON CONFLICT (country_id, name) DO NOTHING;

SELECT count(*) AS city_count FROM cities;

INSERT INTO neighborhoods (name, city_id, description, reputation_score)
SELECT 'Westlands', id, 'Upscale area.', 85 FROM cities WHERE name = 'Nairobi'
ON CONFLICT (city_id, name) DO NOTHING;

INSERT INTO neighborhoods (name, city_id, description, reputation_score)
SELECT 'Kileleshwa', id, 'Quiet leafy suburb.', 78 FROM cities WHERE name = 'Nairobi'
ON CONFLICT (city_id, name) DO NOTHING;

INSERT INTO neighborhoods (name, city_id, description, reputation_score)
SELECT 'Lavington', id, 'Affluent neighborhood.', 82 FROM cities WHERE name = 'Nairobi'
ON CONFLICT (city_id, name) DO NOTHING;

INSERT INTO neighborhoods (name, city_id, description, reputation_score)
SELECT 'Madaraka', id, 'Close to Strathmore.', 80 FROM cities WHERE name = 'Nairobi'
ON CONFLICT (city_id, name) DO NOTHING;

INSERT INTO neighborhoods (name, city_id, description, reputation_score)
SELECT 'Kasarani', id, 'Home to KU.', 68 FROM cities WHERE name = 'Nairobi'
ON CONFLICT (city_id, name) DO NOTHING;

INSERT INTO neighborhoods (name, city_id, description, reputation_score)
SELECT 'Juja', id, 'Student town.', 75 FROM cities WHERE name = 'Thika'
ON CONFLICT (city_id, name) DO NOTHING;

INSERT INTO neighborhoods (name, city_id, description, reputation_score)
SELECT 'Parklands', id, 'Central Nairobi.', 76 FROM cities WHERE name = 'Nairobi'
ON CONFLICT (city_id, name) DO NOTHING;

INSERT INTO neighborhoods (name, city_id, description, reputation_score)
SELECT 'Kilimani', id, 'Modern apartments.', 81 FROM cities WHERE name = 'Nairobi'
ON CONFLICT (city_id, name) DO NOTHING;
