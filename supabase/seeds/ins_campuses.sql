INSERT INTO campuses (name, university_id, city_id, address)
SELECT 'Main Campus', id, (SELECT id FROM cities WHERE name = 'Nairobi'), 'University Way, Nairobi'
FROM universities WHERE name = 'University of Nairobi'
ON CONFLICT (university_id, city_id, name) DO NOTHING;

INSERT INTO campuses (name, university_id, city_id, address)
SELECT 'Main Campus', id, (SELECT id FROM cities WHERE name = 'Thika'), 'Juja, Kiambu'
FROM universities WHERE name = 'JKUAT'
ON CONFLICT (university_id, city_id, name) DO NOTHING;

INSERT INTO campuses (name, university_id, city_id, address)
SELECT 'Main Campus', id, (SELECT id FROM cities WHERE name = 'Nairobi'), 'Kasarani, Nairobi'
FROM universities WHERE name = 'Kenyatta University'
ON CONFLICT (university_id, city_id, name) DO NOTHING;

INSERT INTO campuses (name, university_id, city_id, address)
SELECT 'Main Campus', id, (SELECT id FROM cities WHERE name = 'Nairobi'), 'Madaraka Estate, Nairobi'
FROM universities WHERE name = 'Strathmore University'
ON CONFLICT (university_id, city_id, name) DO NOTHING;

INSERT INTO campuses (name, university_id, city_id, address)
SELECT 'Main Campus', id, (SELECT id FROM cities WHERE name = 'Nairobi'), 'Haile Selassie Avenue, Nairobi'
FROM universities WHERE name = 'Technical University of Kenya'
ON CONFLICT (university_id, city_id, name) DO NOTHING;

INSERT INTO campuses (name, university_id, city_id, address)
SELECT 'Main Campus', id, (SELECT id FROM cities WHERE name = 'Nairobi'), 'Langata Road, Nairobi'
FROM universities WHERE name = 'Daystar University'
ON CONFLICT (university_id, city_id, name) DO NOTHING;

INSERT INTO campuses (name, university_id, city_id, address)
SELECT 'Main Campus', id, (SELECT id FROM cities WHERE name = 'Nairobi'), 'Karen, Nairobi'
FROM universities WHERE name = 'Africa Nazarene University'
ON CONFLICT (university_id, city_id, name) DO NOTHING;

SELECT count(*) AS campus_count FROM campuses;
