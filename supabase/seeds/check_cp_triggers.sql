SELECT tgname, tgrelid::regclass FROM pg_trigger WHERE tgrelid = 'community_posts'::regclass;
