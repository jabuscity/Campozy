INSERT INTO utility_types (name, icon) VALUES
  ('Electricity', 'zap'), ('Water', 'droplet'), ('Internet', 'wifi'), ('Gas', 'flame'), ('Sewage', 'wind'), ('Waste Collection', 'trash')
ON CONFLICT (name) DO NOTHING;
