INSERT INTO countries (name, code) VALUES ('Kenya', 'KE') ON CONFLICT (code) DO NOTHING;
