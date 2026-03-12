-- Worker invitations table
CREATE TABLE worker_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  worker_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(organization_id, email)
);

ALTER TABLE worker_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Empresa can manage own invitations"
  ON worker_invitations FOR ALL
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Workers can view their own invitations"
  ON worker_invitations FOR SELECT
  USING (email = (SELECT email FROM profiles WHERE id = auth.uid()));

CREATE INDEX idx_worker_invitations_org ON worker_invitations(organization_id);
CREATE INDEX idx_worker_invitations_email ON worker_invitations(email);
