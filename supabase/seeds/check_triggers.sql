SELECT tgname, tgrelid::regclass FROM pg_trigger WHERE tgname LIKE '%campozy%' OR tgname LIKE '%score%' ORDER BY tgrelid;
