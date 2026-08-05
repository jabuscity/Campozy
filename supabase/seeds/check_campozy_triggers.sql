SELECT tgname, tgrelid::regclass FROM pg_trigger WHERE tgname = 'trigger_recalculate_campozy_score';
SELECT tgname, tgrelid::regclass, pg_get_triggerdef(oid) FROM pg_trigger WHERE tgname LIKE '%campozy%' OR tgname LIKE '%recalculate%' ORDER BY tgrelid;
