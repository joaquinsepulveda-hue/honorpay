-- HonorPay RLS Policies

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE boletas ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE f29_declarations ENABLE ROW LEVEL SECURITY;

-- Helper functions
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID AS $$
  SELECT organization_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ORGANIZATIONS
CREATE POLICY "Users can view their organization"
  ON organizations FOR SELECT
  USING (id = get_user_organization_id());

CREATE POLICY "Empresa can update their organization"
  ON organizations FOR UPDATE
  USING (id = get_user_organization_id() AND get_user_role() = 'empresa');

-- PROFILES
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Empresa can view worker profiles in their org or event workers"
  ON profiles FOR SELECT
  USING (
    get_user_role() = 'empresa' AND (
      organization_id = get_user_organization_id() OR
      id IN (
        SELECT ew.worker_id FROM event_workers ew
        JOIN events e ON e.id = ew.event_id
        WHERE e.organization_id = get_user_organization_id()
      )
    )
  );

CREATE POLICY "Empresa can view all worker profiles"
  ON profiles FOR SELECT
  USING (get_user_role() = 'empresa' AND role = 'trabajador');

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- EVENTS
CREATE POLICY "Empresa can view own events"
  ON events FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Trabajador can view events they are invited to"
  ON events FOR SELECT
  USING (
    id IN (
      SELECT event_id FROM event_workers WHERE worker_id = auth.uid()
    )
  );

CREATE POLICY "Empresa can insert events"
  ON events FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id() AND get_user_role() = 'empresa'
  );

CREATE POLICY "Empresa can update own events"
  ON events FOR UPDATE
  USING (organization_id = get_user_organization_id() AND get_user_role() = 'empresa');

CREATE POLICY "Empresa can delete own events"
  ON events FOR DELETE
  USING (organization_id = get_user_organization_id() AND get_user_role() = 'empresa');

-- EVENT WORKERS
CREATE POLICY "Empresa can view event workers for their events"
  ON event_workers FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM events WHERE organization_id = get_user_organization_id()
    )
  );

CREATE POLICY "Trabajador can view own event assignments"
  ON event_workers FOR SELECT
  USING (worker_id = auth.uid());

CREATE POLICY "Empresa can insert event workers"
  ON event_workers FOR INSERT
  WITH CHECK (
    event_id IN (
      SELECT id FROM events WHERE organization_id = get_user_organization_id()
    ) AND get_user_role() = 'empresa'
  );

CREATE POLICY "Empresa can update event workers"
  ON event_workers FOR UPDATE
  USING (
    event_id IN (
      SELECT id FROM events WHERE organization_id = get_user_organization_id()
    ) AND get_user_role() = 'empresa'
  );

CREATE POLICY "Trabajador can update own event assignment status"
  ON event_workers FOR UPDATE
  USING (worker_id = auth.uid() AND get_user_role() = 'trabajador');

-- BOLETAS
CREATE POLICY "Empresa can view boletas for their org"
  ON boletas FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Trabajador can view own boletas"
  ON boletas FOR SELECT
  USING (worker_id = auth.uid());

CREATE POLICY "Trabajador can insert boletas"
  ON boletas FOR INSERT
  WITH CHECK (worker_id = auth.uid() AND get_user_role() = 'trabajador');

-- PAYMENTS
CREATE POLICY "Empresa can view own payments"
  ON payments FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Empresa can insert payments"
  ON payments FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id() AND get_user_role() = 'empresa');

CREATE POLICY "Empresa can update own payments"
  ON payments FOR UPDATE
  USING (organization_id = get_user_organization_id() AND get_user_role() = 'empresa');

-- PAYMENT ITEMS
CREATE POLICY "Empresa can view payment items for their payments"
  ON payment_items FOR SELECT
  USING (
    payment_id IN (
      SELECT id FROM payments WHERE organization_id = get_user_organization_id()
    )
  );

CREATE POLICY "Trabajador can view own payment items"
  ON payment_items FOR SELECT
  USING (worker_id = auth.uid());

CREATE POLICY "Empresa can insert payment items"
  ON payment_items FOR INSERT
  WITH CHECK (
    payment_id IN (
      SELECT id FROM payments WHERE organization_id = get_user_organization_id()
    ) AND get_user_role() = 'empresa'
  );

-- F29 DECLARATIONS
CREATE POLICY "Empresa can view own F29"
  ON f29_declarations FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Empresa can insert F29"
  ON f29_declarations FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id() AND get_user_role() = 'empresa');

CREATE POLICY "Empresa can update own F29"
  ON f29_declarations FOR UPDATE
  USING (organization_id = get_user_organization_id() AND get_user_role() = 'empresa');
