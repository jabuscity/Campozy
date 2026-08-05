INSERT INTO hygiene_categories (name) VALUES
  ('restrooms'), ('kitchen'), ('common areas'), ('bedrooms'), ('outdoor spaces'), ('waste management')
ON CONFLICT (name) DO NOTHING;

SELECT count(*) AS hc_count FROM hygiene_categories;
