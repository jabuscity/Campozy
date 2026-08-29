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
  ('General', 'General campus discussions'),
  ('Academics', 'Academic advice and resources'),
  ('Hostels', 'Hostel life and housing discussions'),
  ('Campus Life', 'Student life and events'),
  ('Relationships', 'Relationships and social connections'),
  ('Faith', 'Faith-based resources and campus spiritual life'),
  ('Events', 'Campus events and meetups'),
  ('Marketplace', 'Buy, sell, and trade with students'),
  ('Technology', 'Tech talk, gadgets, and digital tips'),
  ('Careers', 'Jobs, internships, and career advice')
ON CONFLICT (name) DO NOTHING;

INSERT INTO roles (name, description) VALUES
  ('student', 'Student'), ('owner', 'Property owner'), ('scout', 'Campus scout'),
  ('ambassador', 'Ambassador'), ('employer', 'Employer'), ('moderator', 'Moderator')
ON CONFLICT (name) DO NOTHING;

SELECT count(*) AS amenity_count FROM amenities;
SELECT count(*) AS utility_count FROM utilities;
