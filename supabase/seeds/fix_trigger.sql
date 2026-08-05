CREATE OR REPLACE FUNCTION public.trigger_recalculate_campozy_score()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_id uuid;
BEGIN
    v_id := COALESCE(
        (TO_JSONB(COALESCE(NEW, OLD))->>'id')::uuid,
        (TO_JSONB(COALESCE(NEW, OLD))->>'student_id')::uuid,
        (TO_JSONB(COALESCE(NEW, OLD))->>'user_id')::uuid,
        (TO_JSONB(COALESCE(NEW, OLD))->>'author_id')::uuid
    );
    IF v_id IS NOT NULL THEN
        PERFORM recalculate_campozy_score(v_id);
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$function$;
