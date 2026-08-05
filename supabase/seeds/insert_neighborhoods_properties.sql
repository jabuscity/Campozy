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

INSERT INTO properties (owner_id, neighborhood_id, property_type_id, name, description, address, monthly_price, currency, status, verification_level, campozy_score, is_active)
SELECT 
  (SELECT id FROM profiles WHERE username = 'owner_james'),
  (SELECT id FROM neighborhoods WHERE name = 'Westlands'),
  (SELECT id FROM property_types WHERE name = 'Hostel'),
  'The Westlands Residency',
  'A well maintained hostel in Westlands.',
  '123 Westlands Road, Nairobi',
  35000, 'KES', 'active', 'campozy_verified', 92, true
ON CONFLICT DO NOTHING;

INSERT INTO properties (owner_id, neighborhood_id, property_type_id, name, description, address, monthly_price, currency, status, verification_level, campozy_score, is_active)
SELECT 
  (SELECT id FROM profiles WHERE username = 'owner_sarah'),
  (SELECT id FROM neighborhoods WHERE name = 'Madaraka'),
  (SELECT id FROM property_types WHERE name = 'Hostel'),
  'Madaraka Estate Residences',
  'A well maintained hostel in Madaraka.',
  '45 Madaraka Road, Nairobi',
  28000, 'KES', 'active', 'community_verified', 85, true
ON CONFLICT DO NOTHING;

SELECT count(*) AS neighborhood_count FROM neighborhoods;
SELECT count(*) AS property_count FROM properties;
