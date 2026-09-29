/*
# Create ticket system tables (single-tenant, no auth)

1. New Tables
- `tickets` — main ticket/chamado records
  - id (uuid, primary key)
  - ticket_number (integer, auto-incremented display number for human reference)
  - title (text, short summary of the issue)
  - description (text, detailed description of the problem)
  - requester_name (text, name of the person requesting)
  - requester_email (text, contact email)
  - requester_department (text, department of the requester)
  - category (text, category: hardware, software, rede, acesso, outro)
  - priority (text, priority: baixa, media, alta, critica)
  - status (text, status: aberto, em_andamento, aguardando, resolvido, fechado)
  - assigned_to (text, name of the assigned technician)
  - created_at (timestamptz)
  - updated_at (timestamptz)

- `ticket_updates` — progress updates / comments on tickets
  - id (uuid, primary key)
  - ticket_id (uuid, foreign key to tickets ON DELETE CASCADE)
  - author_name (text, name of person adding the update)
  - content (text, the update message)
  - new_status (text, optional status change associated with this update)
  - created_at (timestamptz)

2. Security
- Enable RLS on both tables.
- Allow anon + authenticated CRUD because the data is intentionally shared (internal portal, no sign-in).
*/

CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number integer GENERATED ALWAYS AS IDENTITY,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  requester_name text NOT NULL,
  requester_email text NOT NULL,
  requester_department text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'outro',
  priority text NOT NULL DEFAULT 'media',
  status text NOT NULL DEFAULT 'aberto',
  assigned_to text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_tickets" ON tickets;
CREATE POLICY "anon_select_tickets" ON tickets FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_tickets" ON tickets;
CREATE POLICY "anon_insert_tickets" ON tickets FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_tickets" ON tickets;
CREATE POLICY "anon_update_tickets" ON tickets FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_tickets" ON tickets;
CREATE POLICY "anon_delete_tickets" ON tickets FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS ticket_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  content text NOT NULL,
  new_status text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ticket_updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_ticket_updates" ON ticket_updates;
CREATE POLICY "anon_select_ticket_updates" ON ticket_updates FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_ticket_updates" ON ticket_updates;
CREATE POLICY "anon_insert_ticket_updates" ON ticket_updates FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_ticket_updates" ON ticket_updates;
CREATE POLICY "anon_update_ticket_updates" ON ticket_updates FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_ticket_updates" ON ticket_updates;
CREATE POLICY "anon_delete_ticket_updates" ON ticket_updates FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ticket_updates_ticket_id ON ticket_updates(ticket_id);
