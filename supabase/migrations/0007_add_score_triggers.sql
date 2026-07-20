-- ============================================================================
-- SCORE AUTO-COMPUTATION
-- Additive migration: extends trigger coverage to properties, businesses,
-- and neighborhoods so campozy_score / reputation_score stay in sync
-- with reviews, utility reports, and hygiene reports.
-- ============================================================================

-- =====================================================
-- PROPERTY SCORE
-- =====================================================
CREATE OR REPLACE FUNCTION recalculate_property_score(p_property_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  v_safety NUMERIC := 0;
  v_hygiene NUMERIC := 0;
  v_water NUMERIC := 0;
  v_electricity NUMERIC := 0;
  v_internet NUMERIC := 0;
  v_management NUMERIC := 0;
  v_accessibility NUMERIC := 0;
  v_value_for_money NUMERIC := 0;
  v_overall NUMERIC := 0;
  v_count INTEGER := 0;
  v_score NUMERIC := 0;
BEGIN
  SELECT
    COALESCE(AVG(safety_rating), 0),
    COALESCE(AVG(hygiene_rating), 0),
    COALESCE(AVG(water_rating), 0),
    COALESCE(AVG(electricity_rating), 0),
    COALESCE(AVG(internet_rating), 0),
    COALESCE(AVG(management_rating), 0),
    COALESCE(AVG(accessibility_rating), 0),
    COALESCE(AVG(value_for_money_rating), 0),
    COALESCE(AVG(overall_rating), 0),
    COUNT(*)
  INTO
    v_safety, v_hygiene, v_water, v_electricity, v_internet,
    v_management, v_accessibility, v_value_for_money, v_overall, v_count
  FROM public.property_reviews
  WHERE property_id = p_property_id;

  IF v_count > 0 THEN
    v_score :=
      (v_safety * 3.0) +
      (v_hygiene * 2.0) +
      (v_water * 2.0) +
      (v_electricity * 2.0) +
      (v_internet * 1.5) +
      (v_management * 1.5) +
      (v_accessibility * 1.0) +
      (v_value_for_money * 2.0);

    v_score := LEAST(100, GREATEST(0, ROUND((v_score / 16.0) * 5.0)));
  ELSE
    SELECT
      COALESCE(AVG(reliability_score), 0),
      COUNT(*)
    INTO v_electricity, v_count
    FROM public.property_utilities
    WHERE property_id = p_property_id;

    IF v_count > 0 THEN
      v_score := LEAST(100, GREATEST(0, ROUND(v_electricity)));
    ELSE
      v_score := 0;
    END IF;
  END IF;

  UPDATE public.properties
  SET campozy_score = v_score,
      updated_at = NOW()
  WHERE id = p_property_id;
END;
$$;

CREATE OR REPLACE FUNCTION trigger_recalculate_property_score()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  PERFORM recalculate_property_score(COALESCE(NEW.property_id, OLD.property_id));
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_property_review_score ON property_reviews;
CREATE TRIGGER trg_property_review_score
AFTER INSERT OR UPDATE OR DELETE ON property_reviews
FOR EACH ROW EXECUTE FUNCTION trigger_recalculate_property_score();

DROP TRIGGER IF EXISTS trg_property_utility_score ON property_utilities;
CREATE TRIGGER trg_property_utility_score
AFTER INSERT OR UPDATE OR DELETE ON property_utilities
FOR EACH ROW EXECUTE FUNCTION trigger_recalculate_property_score();

-- =====================================================
-- BUSINESS SCORE
-- =====================================================
CREATE OR REPLACE FUNCTION recalculate_business_score(p_business_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  v_avg NUMERIC := 0;
  v_count INTEGER := 0;
BEGIN
  SELECT
    COALESCE(AVG(overall_rating), 0),
    COUNT(*)
  INTO v_avg, v_count
  FROM public.business_reviews
  WHERE business_id = p_business_id;

  IF v_count > 0 THEN
    v_avg := LEAST(100, GREATEST(0, ROUND((v_avg - 1) * 25)));
  ELSE
    v_avg := 0;
  END IF;

  UPDATE public.businesses
  SET campozy_score = v_avg,
      updated_at = NOW()
  WHERE id = p_business_id;
END;
$$;

CREATE OR REPLACE FUNCTION trigger_recalculate_business_score()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  PERFORM recalculate_business_score(COALESCE(NEW.business_id, OLD.business_id));
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_business_review_score ON business_reviews;
CREATE TRIGGER trg_business_review_score
AFTER INSERT OR UPDATE OR DELETE ON business_reviews
FOR EACH ROW EXECUTE FUNCTION trigger_recalculate_business_score();

-- =====================================================
-- NEIGHBORHOOD SCORE
-- =====================================================
CREATE OR REPLACE FUNCTION recalculate_neighborhood_score(p_neighborhood_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  v_safety NUMERIC := 0;
  v_transport NUMERIC := 0;
  v_amenities NUMERIC := 0;
  v_count INTEGER := 0;
  v_score NUMERIC := 0;
BEGIN
  SELECT
    COALESCE(AVG(safety_rating), 0),
    COALESCE(AVG(transport_rating), 0),
    COALESCE(AVG(amenities_rating), 0),
    COUNT(*)
  INTO
    v_safety, v_transport, v_amenities, v_count
  FROM public.neighborhood_reviews
  WHERE neighborhood_id = p_neighborhood_id;

  IF v_count > 0 THEN
    v_score := (v_safety * 3.0) + (v_transport * 2.0) + (v_amenities * 1.0);
    v_score := LEAST(100, GREATEST(0, ROUND((v_score / 6.0) * 5.0)));
  ELSE
    v_score := 0;
  END IF;

  UPDATE public.neighborhoods
  SET reputation_score = v_score,
      updated_at = NOW()
  WHERE id = p_neighborhood_id;
END;
$$;

CREATE OR REPLACE FUNCTION trigger_recalculate_neighborhood_score()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  PERFORM recalculate_neighborhood_score(COALESCE(NEW.neighborhood_id, OLD.neighborhood_id));
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_neighborhood_review_score ON neighborhood_reviews;
CREATE TRIGGER trg_neighborhood_review_score
AFTER INSERT OR UPDATE OR DELETE ON neighborhood_reviews
FOR EACH ROW EXECUTE FUNCTION trigger_recalculate_neighborhood_score();

-- =====================================================
-- FUNCTION SECURITY HARDENING
-- =====================================================
ALTER FUNCTION recalculate_property_score(UUID) SET search_path = public;
ALTER FUNCTION trigger_recalculate_property_score() SET search_path = public;
ALTER FUNCTION recalculate_business_score(UUID) SET search_path = public;
ALTER FUNCTION trigger_recalculate_business_score() SET search_path = public;
ALTER FUNCTION recalculate_neighborhood_score(UUID) SET search_path = public;
ALTER FUNCTION trigger_recalculate_neighborhood_score() SET search_path = public;
