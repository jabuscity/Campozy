INSERT INTO amenities (name, category) VALUES
  ('Wi-Fi', 'general'), ('Parking', 'general'), ('Security', 'general'), ('Generator', 'general'),
  ('Borehole', 'general'), ('CCTV', 'general'), ('Swimming Pool', 'general'), ('Gym', 'general'),
  ('Laundry', 'general'), ('Study Room', 'general')
ON CONFLICT (name) DO NOTHING;
