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
  ('student', 'Student'), ('owner', 'Owner'), ('scout', 'Scout'),
  ('ambassador', 'Ambassador'), ('employer', 'Employer'), ('moderator', 'Moderator'),
  ('admin', 'Admin'), ('mentor', 'Mentor'), ('alumni', 'Alumni'), ('parent', 'Parent')
ON CONFLICT (name) DO NOTHING;

SELECT count(*) AS cat_count FROM discussion_categories;
SELECT count(*) AS role_count FROM roles;
