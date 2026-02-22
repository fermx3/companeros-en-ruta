-- Backfill clients.last_visit_date from actual visit data
-- and create a trigger to keep it automatically updated.

-- 1. Backfill existing data
UPDATE clients c
SET last_visit_date = sub.max_visit_date
FROM (
  SELECT client_id, MAX(visit_date) AS max_visit_date
  FROM visits
  WHERE deleted_at IS NULL
    AND visit_status NOT IN ('cancelled', 'no_show')
  GROUP BY client_id
) sub
WHERE c.id = sub.client_id;

-- 2. Create the trigger function
CREATE OR REPLACE FUNCTION update_client_last_visit_date()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _client_id uuid;
  _new_date  date;
BEGIN
  -- Determine which client_id to update
  IF TG_OP = 'DELETE' THEN
    _client_id := OLD.client_id;
  ELSE
    _client_id := NEW.client_id;
  END IF;

  -- Also handle client_id change on UPDATE
  IF TG_OP = 'UPDATE' AND OLD.client_id IS DISTINCT FROM NEW.client_id THEN
    -- Recalculate for the OLD client
    SELECT MAX(visit_date) INTO _new_date
    FROM visits
    WHERE client_id = OLD.client_id
      AND deleted_at IS NULL
      AND visit_status NOT IN ('cancelled', 'no_show');

    UPDATE clients
    SET last_visit_date = _new_date
    WHERE id = OLD.client_id;
  END IF;

  -- Recalculate for the current client
  SELECT MAX(visit_date) INTO _new_date
  FROM visits
  WHERE client_id = _client_id
    AND deleted_at IS NULL
    AND visit_status NOT IN ('cancelled', 'no_show');

  UPDATE clients
  SET last_visit_date = _new_date
  WHERE id = _client_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- 3. Create the trigger (fires on insert, update, delete)
CREATE TRIGGER trigger_update_client_last_visit_date
  AFTER INSERT OR UPDATE OF visit_date, visit_status, deleted_at, client_id
     OR DELETE
  ON visits
  FOR EACH ROW
  EXECUTE FUNCTION update_client_last_visit_date();
