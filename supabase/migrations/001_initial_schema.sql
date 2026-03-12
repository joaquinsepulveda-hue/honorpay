-- HonorPay Initial Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations (empresas / banqueteras)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  rut TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles (all users: empresa + trabajador)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN ('empresa', 'trabajador')),
  full_name TEXT NOT NULL,
  rut TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  -- Banking info (for workers)
  bank_name TEXT,
  bank_account_type TEXT CHECK (bank_account_type IN ('cuenta_corriente', 'cuenta_vista', 'cuenta_rut', 'cuenta_ahorro')),
  bank_account_number TEXT,
  -- Onboarding
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events (eventos)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  location TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'borrador'
    CHECK (status IN ('borrador', 'invitaciones_enviadas', 'boletas_pendientes', 'listo_pagar', 'pagado')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event Workers (asignacion trabajador-evento)
CREATE TABLE event_workers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role_description TEXT, -- e.g. "Garzón", "Bartender", "Supervisor"
  gross_amount INTEGER NOT NULL DEFAULT 0, -- en CLP
  retention_amount INTEGER GENERATED ALWAYS AS (ROUND(gross_amount * 0.1075)) STORED,
  net_amount INTEGER GENERATED ALWAYS AS (gross_amount - ROUND(gross_amount * 0.1075)) STORED,
  status TEXT NOT NULL DEFAULT 'invitado'
    CHECK (status IN ('invitado', 'aceptado', 'rechazado', 'boleta_emitida', 'pagado')),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  UNIQUE(event_id, worker_id)
);

-- Boletas (boletas de honorarios emitidas)
CREATE TABLE boletas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_worker_id UUID NOT NULL REFERENCES event_workers(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  folio TEXT NOT NULL UNIQUE, -- e.g. HP-2025-001234
  gross_amount INTEGER NOT NULL,
  retention_amount INTEGER NOT NULL,
  net_amount INTEGER NOT NULL,
  period_year INTEGER NOT NULL,
  period_month INTEGER NOT NULL,
  sii_status TEXT NOT NULL DEFAULT 'emitida'
    CHECK (sii_status IN ('borrador', 'emitida', 'anulada')),
  emitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments (pagos masivos)
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  total_gross INTEGER NOT NULL DEFAULT 0,
  total_retention INTEGER NOT NULL DEFAULT 0,
  total_net INTEGER NOT NULL DEFAULT 0,
  worker_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (status IN ('pendiente', 'procesando', 'completado', 'fallido')),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Items (transferencias individuales)
CREATE TABLE payment_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  event_worker_id UUID NOT NULL REFERENCES event_workers(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  boleta_id UUID REFERENCES boletas(id),
  gross_amount INTEGER NOT NULL,
  retention_amount INTEGER NOT NULL,
  net_amount INTEGER NOT NULL,
  bank_name TEXT,
  bank_account_number TEXT,
  status TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (status IN ('pendiente', 'completado', 'fallido')),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- F29 Declarations (declaraciones mensuales SII)
CREATE TABLE f29_declarations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  period_year INTEGER NOT NULL,
  period_month INTEGER NOT NULL,
  total_gross INTEGER NOT NULL DEFAULT 0,
  total_retention INTEGER NOT NULL DEFAULT 0,
  boleta_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (status IN ('pendiente', 'declarado', 'pagado')),
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  declared_at TIMESTAMPTZ,
  UNIQUE(organization_id, period_year, period_month)
);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX idx_events_organization ON events(organization_id);
CREATE INDEX idx_event_workers_event ON event_workers(event_id);
CREATE INDEX idx_event_workers_worker ON event_workers(worker_id);
CREATE INDEX idx_boletas_organization ON boletas(organization_id);
CREATE INDEX idx_boletas_worker ON boletas(worker_id);
CREATE INDEX idx_boletas_period ON boletas(period_year, period_month);
CREATE INDEX idx_payments_organization ON payments(organization_id);
CREATE INDEX idx_payment_items_payment ON payment_items(payment_id);
CREATE INDEX idx_f29_organization ON f29_declarations(organization_id);
