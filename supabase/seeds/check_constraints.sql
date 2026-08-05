SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'campuses' AND constraint_type = 'UNIQUE';
SELECT conname FROM pg_constraint WHERE conrelid = 'campuses'::regclass AND contype = 'u';
