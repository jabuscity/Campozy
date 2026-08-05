-- Fix trigger function to handle missing columns gracefully
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
        NULLIF(NEW.id::text, ''),
        NULLIF(OLD.id::text, ''),
        NULLIF(NEW.student_id::text, ''),
        NULLIF(OLD.student_id::text, ''),
        NULLIF(NEW.user_id::text, ''),
        NULLIF(OLD.user_id::text, ''),
        NULLIF(NEW.author_id::text, ''),
        NULLIF(OLD.author_id::text, '')
    );
    IF v_id IS NOT NULL THEN
        PERFORM recalculate_campozy_score(v_id);
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Seed utilities table
INSERT INTO utilities (name) VALUES 
  ('Electricity'), 
  ('Water'), 
  ('Internet'), 
  ('Gas'), 
  ('Sewage'), 
  ('Waste Collection')
ON CONFLICT (name) DO NOTHING;
