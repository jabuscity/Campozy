-- ============================================
-- Campozy Comprehensive Visual Analysis Seed
-- ============================================

DO $$
DECLARE
  uid UUID;
BEGIN

-- ============= COUNTRIES =============
INSERT INTO countries (name, code) VALUES
  ('Kenya', 'KE'), ('Uganda', 'UG'), ('Tanzania', 'TZ')
ON CONFLICT (code) DO NOTHING;

-- ============= CITIES =============
INSERT INTO cities (country_id, name)
SELECT c.id, n.city FROM (VALUES
  ('Nairobi'), ('Mombasa'), ('Kisumu'), ('Nakuru'), ('Eldoret'), ('Thika')
) AS n(city) CROSS JOIN countries c WHERE c.code = 'KE'
ON CONFLICT (country_id, name) DO NOTHING;

-- ============= UNIVERSITIES =============
INSERT INTO universities (name, short_name, city_id, website) VALUES
  ('University of Nairobi', 'UoN', (SELECT id FROM cities WHERE name = 'Nairobi'), 'https://uonbi.ac.ke'),
  ('JKUAT', 'JKUAT', (SELECT id FROM cities WHERE name = 'Thika'), 'https://jkuat.ac.ke'),
  ('Kenyatta University', 'KU', (SELECT id FROM cities WHERE name = 'Nairobi'), 'https://kenyatta.ac.ke'),
  ('Strathmore University', 'Strathmore', (SELECT id FROM cities WHERE name = 'Nairobi'), 'https://strathmore.edu'),
  ('Technical University of Kenya', 'TUK', (SELECT id FROM cities WHERE name = 'Nairobi'), 'https://tukenya.ac.ke')
ON CONFLICT (name) DO NOTHING;

-- ============= CAMPUSES =============
INSERT INTO campuses (name, university_id, city_id, address) VALUES
  ('Main Campus', (SELECT id FROM universities WHERE short_name = 'UoN'), (SELECT id FROM cities WHERE name = 'Nairobi'), 'University Way, Nairobi'),
  ('Main Campus', (SELECT id FROM universities WHERE short_name = 'JKUAT' LIMIT 1), (SELECT id FROM cities WHERE name = 'Thika'), 'Juja, Kiambu'),
  ('Main Campus', (SELECT id FROM universities WHERE short_name = 'KU'), (SELECT id FROM cities WHERE name = 'Nairobi'), 'Kasarani, Nairobi'),
  ('Main Campus', (SELECT id FROM universities WHERE short_name = 'Strathmore'), (SELECT id FROM cities WHERE name = 'Nairobi'), 'Madaraka Estate, Nairobi'),
  ('Main Campus', (SELECT id FROM universities WHERE short_name = 'TUK'), (SELECT id FROM cities WHERE name = 'Nairobi'), 'Haile Selassie Avenue, Nairobi')
ON CONFLICT (city_id, name) DO NOTHING;

-- ============= NEIGHBORHOODS =============
INSERT INTO neighborhoods (name, city_id, description, reputation_score) VALUES
  ('Westlands', (SELECT id FROM cities WHERE name = 'Nairobi'), 'Upscale area close to many universities.', 85),
  ('Kileleshwa', (SELECT id FROM cities WHERE name = 'Nairobi'), 'Quiet leafy suburb with great student housing.', 78),
  ('Lavington', (SELECT id FROM cities WHERE name = 'Nairobi'), 'Affluent neighborhood popular with expats and students.', 82),
  ('South B', (SELECT id FROM cities WHERE name = 'Nairobi'), 'Dense residential area with affordable hostels.', 65),
  ('Madaraka', (SELECT id FROM cities WHERE name = 'Nairobi'), 'Close to Strathmore University with many student hostels.', 80),
  ('Kasarani', (SELECT id FROM cities WHERE name = 'Nairobi'), 'Home to Kenyatta University and affordable housing.', 68),
  ('Juja', (SELECT id FROM cities WHERE name = 'Thika'), 'Student town surrounding JKUAT main campus.', 75),
  ('Parklands', (SELECT id FROM cities WHERE name = 'Nairobi'), 'Central Nairobi location with diverse housing.', 76),
  ('Kilimani', (SELECT id FROM cities WHERE name = 'Nairobi'), 'Trendy area with modern apartments and hostels.', 81),
  ('Kawangware', (SELECT id FROM cities WHERE name = 'Nairobi'), 'Vibrant community with budget-friendly housing.', 62),
  ('Ruiru', (SELECT id FROM cities WHERE name = 'Nairobi'), 'Growing town with new student housing developments.', 58),
  ('Embakassi', (SELECT id FROM cities WHERE name = 'Nairobi'), 'Residential area near JKUAT Juja campus.', 72),
  ('South C', (SELECT id FROM cities WHERE name = 'Nairobi'), 'Mixed residential area with good transport links.', 70),
  ('Thika', (SELECT id FROM cities WHERE name = 'Thika'), 'Industrial town with both residential and student housing.', 60),
  ('Buruburu', (SELECT id FROM cities WHERE name = 'Nairobi'), 'Large residential estate with family hostels.', 67)
ON CONFLICT (city_id, name) DO NOTHING;

END $$;

-- ============================================
-- ROLES
-- ============================================
INSERT INTO roles (name, description) VALUES
  ('student', 'Student role'), ('owner', 'Property owner role'), ('scout', 'Campus scout role'),
  ('ambassador', 'Campus ambassador role'), ('mentor', 'Mentor role'), ('alumni', 'Alumni role'),
  ('employer', 'Employer role'), ('parent', 'Parent role'), ('moderator', 'Moderator role'), ('admin', 'Admin role')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- BADGES
-- ============================================
INSERT INTO badges (name, slug, description, category) VALUES
  ('Early Adopter', 'early-adopter', 'Among the first users of Campozy', 'community'),
  ('Top Reviewer', 'top-reviewer', 'Has written 50+ property reviews', 'trust'),
  ('Verification Champion', 'verification-champion', 'Verified 10+ properties', 'trust'),
  ('Community Helper', 'community-helper', 'Helped 100+ students', 'community'),
  ('Scout Elite', 'scout-elite', 'Top-performing campus scout', 'scout'),
  ('Ambassador Star', 'ambassador-star', 'Outstanding campus ambassador', 'ambassador'),
  ('Trusted Owner', 'trusted-owner', 'Verified property owner', 'trust'),
  ('Student Leader', 'student-leader', 'Active in campus discussions', 'community')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- PROPERTY TYPES
-- ============================================
INSERT INTO property_types (name, description) VALUES
  ('Hostel', 'Shared student housing with multiple rooms'),
  ('Apartment', 'Self-contained student apartment'),
  ('Studio', 'Single-room studio for a student'),
  ('Shared House', 'House shared by multiple students'),
  ('Boarding', 'Traditional boarding facility'),
  ('Bedsitter', 'Single room with small kitchen area')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- AMENITIES
-- ============================================
INSERT INTO amenities (name, category) VALUES
  ('Wi-Fi', 'general'), ('Parking', 'general'), ('Security', 'general'), ('Generator', 'general'),
  ('Borehole', 'general'), ('CCTV', 'general'), ('Swimming Pool', 'general'), ('Gym', 'general'),
  ('Laundry', 'general'), ('Study Room', 'general'), ('Recreation Area', 'general'),
  ('Balcony', 'general'), ('Elevator', 'general'), ('Backup Water', 'general'),
  ('Rooftop Terrace', 'general'), ('DSTV', 'general'), ('Garbage Collection', 'general'),
  ('Wheelchair Access', 'general')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- UTILITY TYPES + UTILITIES
-- ============================================
INSERT INTO utility_types (name) VALUES
  ('Electricity'), ('Water'), ('Internet'), ('Gas'), ('Sewage'), ('Waste Collection')
ON CONFLICT (name) DO NOTHING;

INSERT INTO utilities (name) VALUES
  ('Electricity'), ('Water'), ('Internet'), ('Gas'), ('Sewage'), ('Waste Collection')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- HYGIENE CATEGORIES
-- ============================================
INSERT INTO hygiene_categories (name) VALUES
  ('Restrooms'), ('Kitchen'), ('Common Areas'), ('Bedrooms'), ('Outdoor Spaces'), ('Waste Management')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- DISCUSSION CATEGORIES
-- ============================================
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

-- ============================================
-- NEIGHBORHOOD-CAMPUS DISTANCES
-- ============================================
INSERT INTO neighborhood_campus_distances (neighborhood_id, campus_id, distance_km, walking_time_min, transport_time_min, transport_cost)
SELECT n.id, c.id,
  (random() * 20 + 1)::numeric(8,2),
  (random() * 120 + 10)::int,
  (random() * 60 + 5)::int,
  (random() * 200 + 10)::int
FROM neighborhoods n CROSS JOIN campuses c
WHERE n.city_id = (SELECT id FROM cities WHERE name = 'Nairobi')
  AND c.address LIKE '%Nairobi%'
ON CONFLICT (neighborhood_id, campus_id) DO NOTHING;

-- ============================================
-- HIGH SCHOOLS
-- ============================================
INSERT INTO high_schools (name, city_id) VALUES
  ('Alliance High School', (SELECT id FROM cities WHERE name = 'Nairobi')),
  ('Maranda High School', (SELECT id FROM cities WHERE name = 'Nairobi')),
  ('Mangu High School', (SELECT id FROM cities WHERE name = 'Nairobi')),
  ('Nairobi School', (SELECT id FROM cities WHERE name = 'Nairobi')),
  ('Lenana School', (SELECT id FROM cities WHERE name = 'Nairobi'))
ON CONFLICT (name) DO NOTHING;
