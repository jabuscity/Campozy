INSERT INTO utilities (name) VALUES ('Electricity'), ('Water'), ('Internet'), ('Gas'), ('Sewage'), ('Waste Collection') ON CONFLICT (name) DO NOTHING;
