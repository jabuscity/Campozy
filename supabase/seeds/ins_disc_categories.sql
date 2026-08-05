INSERT INTO discussion_categories (name, description) VALUES
  ('General', 'General campus discussions'), ('Academics', 'Academic advice'),
  ('Hostels', 'Hostel life'), ('Campus Life', 'Student life'), ('Careers', 'Jobs and careers')
ON CONFLICT (name) DO NOTHING;

INSERT INTO roles (name, description) VALUES
  ('student', 'Student'), ('owner', 'Owner'), ('scout', 'Scout'),
  ('ambassador', 'Ambassador'), ('employer', 'Employer'), ('moderator', 'Moderator'),
  ('admin', 'Admin'), ('mentor', 'Mentor'), ('alumni', 'Alumni'), ('parent', 'Parent')
ON CONFLICT (name) DO NOTHING;

SELECT count(*) AS cat_count FROM discussion_categories;
SELECT count(*) AS role_count FROM roles;
