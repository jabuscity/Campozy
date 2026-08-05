SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_name IN ('property_types', 'badges', 'high_schools', 'owners') ORDER BY table_name, ordinal_position;
