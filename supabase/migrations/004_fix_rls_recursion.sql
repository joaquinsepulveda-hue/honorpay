-- Fix infinite recursion: events <-> event_workers RLS cycle
-- The cycle: events policy queries event_workers, event_workers policy queries events

-- Helper: returns organization_id of an event bypassing RLS
CREATE OR REPLACE FUNCTION get_event_organization_id(p_event_id UUID)
RETURNS UUID AS $$
  SELECT organization_id FROM events WHERE id = p_event_id;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Recreate event_workers policies that referenced events (causing recursion)
DROP POLICY IF EXISTS "Empresa can view event workers for their events" ON event_workers;
DROP POLICY IF EXISTS "Empresa can insert event workers" ON event_workers;
DROP POLICY IF EXISTS "Empresa can update event workers" ON event_workers;

CREATE POLICY "Empresa can view event workers for their events"
  ON event_workers FOR SELECT
  USING (get_event_organization_id(event_id) = get_user_organization_id());

CREATE POLICY "Empresa can insert event workers"
  ON event_workers FOR INSERT
  WITH CHECK (
    get_event_organization_id(event_id) = get_user_organization_id()
    AND get_user_role() = 'empresa'
  );

CREATE POLICY "Empresa can update event workers"
  ON event_workers FOR UPDATE
  USING (
    get_event_organization_id(event_id) = get_user_organization_id()
    AND get_user_role() = 'empresa'
  );
