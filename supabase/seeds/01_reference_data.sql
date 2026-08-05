INSERT INTO countries (name, code) VALUES
  ('Kenya', 'KE'), ('Uganda', 'UG'), ('Tanzania', 'TZ')
ON CONFLICT (code) DO NOTHING;

INSERT INTO cities (country_id, name)
SELECT c.id, n.city FROM (VALUES
  ('Nairobi'), ('Mombasa'), ('Kisumu'), ('Nakuru'), ('Eldoret'), ('Thika')
) AS n(city) CROSS JOIN countries c WHERE c.code = 'KE'
ON CONFLICT (country_id, name) DO NOTHING;

INSERT INTO universities (name, city_id) VALUES
  ('University of Nairobi', (SELECT id FROM cities WHERE name = 'Nairobi')),
  ('JKUAT', (SELECT id FROM cities WHERE name = 'Thika')),
  ('Kenyatta University', (SELECT id FROM cities WHERE name = 'Nairobi')),
  ('Strathmore University', (SELECT id FROM cities WHERE name = 'Nairobi')),
  ('Technical University of Kenya', (SELECT id FROM cities WHERE name = 'Nairobi'))
ON CONFLICT (name) DO NOTHING;

INSERT INTO campuses (name, university_id, city_id, address) VALUES
  ('Main Campus', (SELECT id FROM universities WHERE name = 'University of Nairobi'), (SELECT id FROM cities WHERE name = 'Nairobi'), 'University Way, Nairobi'),
  ('Main Campus', (SELECT id FROM universities WHERE name = 'JKUAT'), (SELECT id FROM cities WHERE name = 'Thika'), 'Juja, Kiambu'),
  ('Main Campus', (SELECT id FROM universities WHERE name = 'Kenyatta University'), (SELECT id FROM cities WHERE name = 'Nairobi'), 'Kasarani, Nairobi'),
  ('Main Campus', (SELECT id FROM universities WHERE name = 'Strathmore University'), (SELECT id FROM cities WHERE name = 'Nairobi'), 'Madaraka Estate, Nairobi'),
  ('Main Campus', (SELECT id FROM universities WHERE name = 'Technical University of Kenya'), (SELECT id FROM cities WHERE name = 'Nairobi'), 'Haile Selassie Avenue, Nairobi')
ON CONFLICT (university_id, city_id, name) DO NOTHING;

INSERT INTO neighborhoods (name, city_id, description, reputation_score) VALUES
  ('Westlands', (SELECT id FROM cities WHERE name = 'Nairobi'), 'Upscale area.', 85),
  ('Kileleshwa', (SELECT id FROM cities WHERE name = 'Nairobi'), 'Quiet leafy suburb.', 78),
  ('Lavington', (SELECT id FROM cities WHERE name = 'Nairobi'), 'Affluent neighborhood.', 82),
  ('South B', (SELECT id FROM cities WHERE name = 'Nairobi'), 'Affordable hostels.', 65),
  ('Madaraka', (SELECT id FROM cities WHERE name = 'Nairobi'), 'Close to Strathmore.', 80),
  ('Kasarani', (SELECT id FROM cities WHERE name = 'Nairobi'), 'Home to KU.', 68),
  ('Juja', (SELECT id FROM cities WHERE name = 'Thika'), 'Student town.', 75),
  ('Parklands', (SELECT id FROM cities WHERE name = 'Nairobi'), 'Central Nairobi.', 76),
  ('Kilimani', (SELECT id FROM cities WHERE name = 'Nairobi'), 'Modern apartments.', 81),
  ('Kawangware', (SELECT id FROM cities WHERE name = 'Nairobi'), 'Budget-friendly.', 62)
ON CONFLICT (city_id, name) DO NOTHING;

INSERT INTO neighborhood_campus_distances (neighborhood_id, campus_id, distance_km, walking_time_min, transport_time_min, transport_cost)
SELECT n.id, c.id,
  (random() * 20 + 1)::numeric(8,2),
  (random() * 120 + 10)::int,
  (random() * 60 + 5)::int,
  (random() * 200 + 10)::int
FROM neighborhoods n CROSS JOIN campuses c
WHERE n.city_id = (SELECT id FROM cities WHERE name = 'Nairobi')
  AND c.city_id = (SELECT id FROM cities WHERE name = 'Nairobi')
ON CONFLICT (neighborhood_id, campus_id) DO NOTHING;
