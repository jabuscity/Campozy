SELECT pg_get_constraintdef((SELECT oid FROM pg_constraint WHERE conrelid = 'hygiene_categories'::regclass AND contype = 'c' LIMIT 1)) AS check_def;
