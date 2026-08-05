SELECT id, name, description, created_at, pg_get_constraintdef((SELECT oid FROM pg_constraint WHERE conrelid = 'utility_types'::regclass AND contype = 'c' LIMIT 1)) AS check_def FROM utility_types;
