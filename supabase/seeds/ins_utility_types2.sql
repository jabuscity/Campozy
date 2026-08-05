INSERT INTO utility_types (name, icon) VALUES
  ('electricity', 'zap'), ('water', 'droplet'), ('internet', 'wifi'), ('gas', 'flame'), ('sewage', 'wind'), ('waste_collection', 'trash')
ON CONFLICT (name) DO NOTHING;
