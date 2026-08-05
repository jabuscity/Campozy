INSERT INTO amenities (name, category) VALUES
  ('Wi-Fi', 'general'), ('Parking', 'general'), ('Security', 'general'), ('Generator', 'general'),
  ('Borehole', 'general'), ('CCTV', 'general'), ('Swimming Pool', 'general'), ('Gym', 'general'),
  ('Laundry', 'general'), ('Study Room', 'general')
ON CONFLICT (name) DO NOTHING;

INSERT INTO utilities (name) VALUES
  ('Electricity'), ('Water'), ('Internet'), ('Gas'), ('Sewage'), ('Waste Collection')
ON CONFLICT (name) DO NOTHING;

INSERT INTO utility_types (name) VALUES
  ('Electricity'), ('Water'), ('Internet'), ('Gas'), ('Sewage'), ('Waste Collection')
ON CONFLICT (name) DO NOTHING;

INSERT INTO discussion_categories (name, description) VALUES
  ('General', 'General campus discussions'), ('Academics', 'Academic advice'),
  ('Hostels', 'Hostel life'), ('Campus Life', 'Student life'), ('Careers', 'Jobs and careers')
ON CONFLICT (name) DO NOTHING;

INSERT INTO roles (name, description) VALUES
  ('student', 'Student'), ('owner', 'Property owner'), ('scout', 'Campus scout'),
  ('ambassador', 'Ambassador'), ('employer', 'Employer'), ('moderator', 'Moderator')
ON CONFLICT (name) DO NOTHING;

SELECT count(*) AS amenity_count FROM amenities;
SELECT count(*) AS utility_count FROM utilities;
