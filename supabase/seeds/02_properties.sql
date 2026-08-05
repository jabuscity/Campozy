WITH 
u AS (SELECT id FROM profiles ORDER BY created_at LIMIT 25),
n AS (SELECT id FROM neighborhoods ORDER BY name),
pt AS (SELECT id FROM property_types ORDER BY name),
owner_profiles AS (SELECT id FROM profiles WHERE username LIKE 'owner%' OR username LIKE 'james%' OR username LIKE 'sarah%' OR username LIKE 'mary%' ORDER BY created_at)

INSERT INTO properties (owner_id, neighborhood_id, property_type_id, name, description, address, location_lat, location_lng, monthly_price, currency, status, verification_level, campozy_score, is_active)
SELECT 
  (SELECT id FROM owner_profiles OFFSET floor(random() * GREATEST((SELECT count(*) FROM owner_profiles), 1)) LIMIT 1),
  (SELECT id FROM n OFFSET floor(random() * (SELECT count(*) FROM n)) LIMIT 1),
  (SELECT id FROM pt OFFSET floor(random() * (SELECT count(*) FROM pt)) LIMIT 1),
  ('{The Westlands Residency,Kileleshwa Heights,Lavington Suites,South B Student Hostel,Madaraka Estate Residences,Juja Student Town,Kasarani Student Lodge,Parklands Plaza,Kilimani Studios,Kawangware Community Hostel,Ruiru Junction Hostel,Embakassi Student Hub,Chiromo Student Apartments,Lower Kabete Hostel,Thika Student Residence,Strathmore Residency,JKUAT Gateway Hostel,KU Student Lodge,TUK Towers,MMU Student Haven,UoN International Hostel,Kiambu Student Village,Mombasa Road Apartments,Ngong Road Suites,Riverbank Hostel}'::text[])[floor(random()*25+1)],
  'A well maintained ' || ('{hostel,apartment,studio,boarding}'::text[])[floor(random()*4+1)] || ' in Nairobi. Close to campus with excellent amenities.',
  floor(random()*200+1)::text || ' Nairobi Road',
  -1.2 + (random() - 0.5) * 0.5,
  36.8 + (random() - 0.5) * 0.5,
  floor(random()*15000+5000),
  'KES',
  ('{active,pending,active,active}'::text[])[floor(random()*4+1)],
  ('{unverified,claimed,community_verified,scout_verified,campozy_verified}'::text[])[floor(random()*5+1)]::verification_level,
  floor(random()*60+40),
  true
FROM generate_series(1, 25)
ON CONFLICT DO NOTHING;
