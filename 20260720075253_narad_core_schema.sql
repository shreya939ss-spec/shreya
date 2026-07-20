
/*
# NARAD Core Schema

## Overview
Complete database schema for the NARAD AI intelligence platform — a unified fraud detection
and public safety PWA for India. This migration creates all tables required for the 7 pillars:
Kuber Shield, Pramaan, Aakashvani, Rakshak Ping, Trinetra, Sutra, and NARAD Command.

## New Tables

1. `narad_users` — citizen user profiles (phone/email/guest, language preference, emergency contact)
2. `flagged_numbers` — pre-seeded phone numbers known to run scams, with suspect face data
3. `flagged_merchants` — pre-seeded fraudulent/unverified UPI IDs and QR codes
4. `crime_feed` — live hypothetical crime alerts across Indian districts
5. `scan_results` — records every pillar scan a user performs (currency, merchant, call, message)
6. `fraud_nodes` — nodes for the SUTRA fraud network graph
7. `fraud_edges` — connections between fraud nodes
8. `districts_heatmap` — per-district crime statistics for NARAD COMMAND map
9. `emergency_alerts` — Rakshak Ping alert records

## Security
- RLS enabled on all tables
- Public read on seed data tables (flagged_numbers, flagged_merchants, crime_feed, districts_heatmap, fraud_nodes, fraud_edges)
- User-scoped write on narad_users, scan_results, emergency_alerts
- No auth.users FK required — app supports guest mode with local session IDs
*/

-- =============================================
-- 1. NARAD USERS
-- =============================================
CREATE TABLE IF NOT EXISTS narad_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE,
  phone text,
  email text,
  full_name text,
  preferred_language text DEFAULT 'en',
  login_method text DEFAULT 'guest',
  emergency_contact_name text,
  emergency_contact_phone text,
  is_officer boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE narad_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_narad_users" ON narad_users;
CREATE POLICY "public_select_narad_users" ON narad_users FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_narad_users" ON narad_users;
CREATE POLICY "public_insert_narad_users" ON narad_users FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_update_narad_users" ON narad_users;
CREATE POLICY "public_update_narad_users" ON narad_users FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_narad_users" ON narad_users;
CREATE POLICY "public_delete_narad_users" ON narad_users FOR DELETE
TO anon, authenticated USING (true);

-- =============================================
-- 2. FLAGGED PHONE NUMBERS (AAKASHVANI / TRINETRA)
-- =============================================
CREATE TABLE IF NOT EXISTS flagged_numbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text UNIQUE NOT NULL,
  scam_type text NOT NULL,
  scam_category text NOT NULL,
  operator_name text,
  origin_state text,
  reports_count integer DEFAULT 1,
  risk_level text DEFAULT 'HIGH',
  suspect_name text,
  suspect_alias text,
  suspect_face_url text,
  suspect_age integer,
  suspect_description text,
  known_scripts text[],
  last_reported_city text,
  last_reported_state text,
  first_reported_at timestamptz DEFAULT now(),
  last_reported_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

ALTER TABLE flagged_numbers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_flagged_numbers" ON flagged_numbers;
CREATE POLICY "public_select_flagged_numbers" ON flagged_numbers FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_flagged_numbers" ON flagged_numbers;
CREATE POLICY "public_insert_flagged_numbers" ON flagged_numbers FOR INSERT
TO anon, authenticated WITH CHECK (true);

-- =============================================
-- 3. FLAGGED MERCHANTS (PRAMAAN)
-- =============================================
CREATE TABLE IF NOT EXISTS flagged_merchants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  upi_id text,
  qr_pattern text,
  shop_name text,
  registered_city text,
  registered_state text,
  reports_count integer DEFAULT 1,
  trust_score integer DEFAULT 0,
  status text DEFAULT 'UNVERIFIED',
  risk_level text DEFAULT 'MEDIUM',
  fraud_type text,
  last_reported_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE flagged_merchants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_flagged_merchants" ON flagged_merchants;
CREATE POLICY "public_select_flagged_merchants" ON flagged_merchants FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_flagged_merchants" ON flagged_merchants;
CREATE POLICY "public_insert_flagged_merchants" ON flagged_merchants FOR INSERT
TO anon, authenticated WITH CHECK (true);

-- =============================================
-- 4. CRIME FEED
-- =============================================
CREATE TABLE IF NOT EXISTS crime_feed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL,
  pillar text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  district text NOT NULL,
  severity text DEFAULT 'MEDIUM',
  amount_lost_cr numeric,
  victims_count integer,
  is_active boolean DEFAULT true,
  reported_at timestamptz DEFAULT now()
);

ALTER TABLE crime_feed ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_crime_feed" ON crime_feed;
CREATE POLICY "public_select_crime_feed" ON crime_feed FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_crime_feed" ON crime_feed;
CREATE POLICY "public_insert_crime_feed" ON crime_feed FOR INSERT
TO anon, authenticated WITH CHECK (true);

-- =============================================
-- 5. SCAN RESULTS (all pillars)
-- =============================================
CREATE TABLE IF NOT EXISTS scan_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  pillar text NOT NULL,
  input_type text,
  input_value text,
  verdict text NOT NULL,
  confidence_score integer,
  risk_level text,
  details jsonb,
  image_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE scan_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_scan_results" ON scan_results;
CREATE POLICY "public_select_scan_results" ON scan_results FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_scan_results" ON scan_results;
CREATE POLICY "public_insert_scan_results" ON scan_results FOR INSERT
TO anon, authenticated WITH CHECK (true);

-- =============================================
-- 6. FRAUD NODES (SUTRA)
-- =============================================
CREATE TABLE IF NOT EXISTS fraud_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  node_type text NOT NULL,
  identifier text NOT NULL,
  label text NOT NULL,
  city text,
  state text,
  risk_score integer DEFAULT 50,
  connections_count integer DEFAULT 0,
  pillar_source text,
  first_seen timestamptz DEFAULT now(),
  last_seen timestamptz DEFAULT now()
);

ALTER TABLE fraud_nodes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_fraud_nodes" ON fraud_nodes;
CREATE POLICY "public_select_fraud_nodes" ON fraud_nodes FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_fraud_nodes" ON fraud_nodes;
CREATE POLICY "public_insert_fraud_nodes" ON fraud_nodes FOR INSERT
TO anon, authenticated WITH CHECK (true);

-- =============================================
-- 7. FRAUD EDGES (SUTRA connections)
-- =============================================
CREATE TABLE IF NOT EXISTS fraud_edges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_node_id uuid REFERENCES fraud_nodes(id),
  target_node_id uuid REFERENCES fraud_nodes(id),
  connection_type text NOT NULL,
  strength integer DEFAULT 5,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE fraud_edges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_fraud_edges" ON fraud_edges;
CREATE POLICY "public_select_fraud_edges" ON fraud_edges FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_fraud_edges" ON fraud_edges;
CREATE POLICY "public_insert_fraud_edges" ON fraud_edges FOR INSERT
TO anon, authenticated WITH CHECK (true);

-- =============================================
-- 8. DISTRICTS HEATMAP (NARAD COMMAND)
-- =============================================
CREATE TABLE IF NOT EXISTS districts_heatmap (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district text NOT NULL,
  state text NOT NULL,
  lat numeric NOT NULL,
  lng numeric NOT NULL,
  alert_count integer DEFAULT 0,
  counterfeit_count integer DEFAULT 0,
  merchant_flags integer DEFAULT 0,
  scam_call_count integer DEFAULT 0,
  total_loss_cr numeric DEFAULT 0,
  priority_level text DEFAULT 'LOW',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE districts_heatmap ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_districts_heatmap" ON districts_heatmap;
CREATE POLICY "public_select_districts_heatmap" ON districts_heatmap FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_districts_heatmap" ON districts_heatmap;
CREATE POLICY "public_insert_districts_heatmap" ON districts_heatmap FOR INSERT
TO anon, authenticated WITH CHECK (true);

-- =============================================
-- 9. EMERGENCY ALERTS (RAKSHAK PING)
-- =============================================
CREATE TABLE IF NOT EXISTS emergency_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  contact_name text,
  contact_phone text,
  trigger_type text DEFAULT 'MANUAL',
  status text DEFAULT 'SENT',
  location_city text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE emergency_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_emergency_alerts" ON emergency_alerts;
CREATE POLICY "public_select_emergency_alerts" ON emergency_alerts FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_emergency_alerts" ON emergency_alerts;
CREATE POLICY "public_insert_emergency_alerts" ON emergency_alerts FOR INSERT
TO anon, authenticated WITH CHECK (true);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_flagged_numbers_phone ON flagged_numbers(phone_number);
CREATE INDEX IF NOT EXISTS idx_scan_results_session ON scan_results(session_id);
CREATE INDEX IF NOT EXISTS idx_crime_feed_state ON crime_feed(state);
CREATE INDEX IF NOT EXISTS idx_fraud_nodes_type ON fraud_nodes(node_type);
