
/*
# NARAD Seed Data — SUTRA Fraud Network Graph

Creates fraud network nodes (phone numbers, UPI IDs, locations, individuals) and
edges showing how flagged events connect — shared numbers, shared locations,
shared UPI handles. This powers the SUTRA fraud network visualization.
*/

-- Nodes
INSERT INTO fraud_nodes (node_type, identifier, label, city, state, risk_score, connections_count, pillar_source) VALUES
('PHONE', '+919876543210', 'CBI Impersonation Number', 'Mumbai', 'Maharashtra', 95, 4, 'AAKASHVANI'),
('PHONE', '+918765432109', 'ED Officer Fraud Number', 'Delhi', 'Delhi', 97, 5, 'AAKASHVANI'),
('PHONE', '+918112233445', 'Microsoft Tech Support Scam', 'Ranchi', 'Jharkhand', 78, 3, 'AAKASHVANI'),
('PHONE', '+918445566778', 'Fake Police Station', 'Pune', 'Maharashtra', 92, 4, 'AAKASHVANI'),
('PHONE', '+918778899001', 'UIDAI Impersonation', 'Delhi', 'Delhi', 94, 3, 'AAKASHVANI'),
('PHONE', '+919001122334', 'FedEx Parcel Scam', 'Jaipur', 'Rajasthan', 82, 2, 'AAKASHVANI'),
('PHONE', '+919667788990', 'UPI Collect Scam', 'Bengaluru', 'Karnataka', 88, 3, 'AAKASHVANI'),
('PHONE', '+917223344556', 'WhatsApp Hijack', 'Bhopal', 'Madhya Pradesh', 85, 2, 'AAKASHVANI'),
('INDIVIDUAL', 'RAJAN_MEHTA', 'Rajan Mehta (Hypothetical)', 'Jamtara', 'Jharkhand', 96, 6, 'AAKASHVANI'),
('INDIVIDUAL', 'VIKASH_KUMAR', 'Vikash Kumar (Hypothetical)', 'Jamtara', 'Jharkhand', 98, 7, 'AAKASHVANI'),
('INDIVIDUAL', 'SANTOSH_BHOSALE', 'Santosh Bhosale (Hypothetical)', 'Pune', 'Maharashtra', 91, 4, 'AAKASHVANI'),
('INDIVIDUAL', 'MUKESH_GUPTA', 'Mukesh Gupta (Hypothetical)', 'Delhi', 'Delhi', 93, 3, 'AAKASHVANI'),
('UPI', 'quickpay.fraud@paytm', 'Quick Pay Ghost Merchant', 'Mumbai', 'Maharashtra', 89, 3, 'PRAMAAN'),
('UPI', 'amazondeal.fake@ybl', 'Fake Amazon Reseller', 'Chennai', 'Tamil Nadu', 95, 4, 'PRAMAAN'),
('UPI', 'saibaba.trust@upi', 'Fake Charity Trust', 'Pune', 'Maharashtra', 87, 2, 'PRAMAAN'),
('UPI', 'swastik.finance@paytm', 'Loan Shark App', 'Bhopal', 'Madhya Pradesh', 91, 3, 'PRAMAAN'),
('LOCATION', 'JAMTARA_HUB', 'Jamtara Cyber Hub', 'Jamtara', 'Jharkhand', 99, 8, 'SUTRA'),
('LOCATION', 'DELHI_HUB', 'Delhi NCR Fraud Ring', 'Delhi', 'Delhi', 94, 6, 'SUTRA'),
('LOCATION', 'MUMBAI_HUB', 'Mumbai Financial Fraud Zone', 'Mumbai', 'Maharashtra', 90, 5, 'SUTRA'),
('LOCATION', 'BENGALURU_HUB', 'Bengaluru Tech Scam Ring', 'Bengaluru', 'Karnataka', 86, 4, 'SUTRA')
ON CONFLICT DO NOTHING;

-- Edges — connect nodes to show the fraud network
-- First, get node IDs by identifier
DO $$
DECLARE
  n_cbi uuid; n_ed uuid; n_microsoft uuid; n_police uuid; n_uidai uuid; n_fedex uuid;
  n_upi_scam uuid; n_whatsapp uuid;
  n_rajan uuid; n_vikash uuid; n_santosh uuid; n_mukesh uuid;
  n_quickpay uuid; n_amazon uuid; n_saibaba uuid; n_swastik uuid;
  n_jamtara uuid; n_delhi uuid; n_mumbai uuid; n_bengaluru uuid;
BEGIN
  SELECT id INTO n_cbi FROM fraud_nodes WHERE identifier = '+919876543210';
  SELECT id INTO n_ed FROM fraud_nodes WHERE identifier = '+918765432109';
  SELECT id INTO n_microsoft FROM fraud_nodes WHERE identifier = '+918112233445';
  SELECT id INTO n_police FROM fraud_nodes WHERE identifier = '+918445566778';
  SELECT id INTO n_uidai FROM fraud_nodes WHERE identifier = '+918778899001';
  SELECT id INTO n_fedex FROM fraud_nodes WHERE identifier = '+919001122334';
  SELECT id INTO n_upi_scam FROM fraud_nodes WHERE identifier = '+919667788990';
  SELECT id INTO n_whatsapp FROM fraud_nodes WHERE identifier = '+917223344556';
  SELECT id INTO n_rajan FROM fraud_nodes WHERE identifier = 'RAJAN_MEHTA';
  SELECT id INTO n_vikash FROM fraud_nodes WHERE identifier = 'VIKASH_KUMAR';
  SELECT id INTO n_santosh FROM fraud_nodes WHERE identifier = 'SANTOSH_BHOSALE';
  SELECT id INTO n_mukesh FROM fraud_nodes WHERE identifier = 'MUKESH_GUPTA';
  SELECT id INTO n_quickpay FROM fraud_nodes WHERE identifier = 'quickpay.fraud@paytm';
  SELECT id INTO n_amazon FROM fraud_nodes WHERE identifier = 'amazondeal.fake@ybl';
  SELECT id INTO n_saibaba FROM fraud_nodes WHERE identifier = 'saibaba.trust@upi';
  SELECT id INTO n_swastik FROM fraud_nodes WHERE identifier = 'swastik.finance@paytm';
  SELECT id INTO n_jamtara FROM fraud_nodes WHERE identifier = 'JAMTARA_HUB';
  SELECT id INTO n_delhi FROM fraud_nodes WHERE identifier = 'DELHI_HUB';
  SELECT id INTO n_mumbai FROM fraud_nodes WHERE identifier = 'MUMBAI_HUB';
  SELECT id INTO n_bengaluru FROM fraud_nodes WHERE identifier = 'BENGALURU_HUB';

  -- Individual → Phone
  INSERT INTO fraud_edges (source_node_id, target_node_id, connection_type, strength) VALUES
  (n_rajan, n_cbi, 'OPERATES', 9),
  (n_vikash, n_ed, 'OPERATES', 10),
  (n_vikash, n_microsoft, 'OPERATES', 7),
  (n_santosh, n_police, 'OPERATES', 8),
  (n_mukesh, n_uidai, 'OPERATES', 9),
  (n_rajan, n_fedex, 'OPERATES', 6),
  (n_vikash, n_whatsapp, 'OPERATES', 7),

  -- Individual → Location (hub)
  (n_rajan, n_jamtara, 'BASED_IN', 10),
  (n_vikash, n_jamtara, 'BASED_IN', 10),
  (n_santosh, n_mumbai, 'BASED_IN', 8),
  (n_mukesh, n_delhi, 'BASED_IN', 9),

  -- Phone → Location (operates from)
  (n_cbi, n_mumbai, 'CALLS_FROM', 7),
  (n_ed, n_delhi, 'CALLS_FROM', 8),
  (n_police, n_mumbai, 'CALLS_FROM', 6),
  (n_uidai, n_delhi, 'CALLS_FROM', 8),
  (n_upi_scam, n_bengaluru, 'CALLS_FROM', 7),
  (n_whatsapp, n_jamtara, 'CALLS_FROM', 6),

  -- UPI → Location
  (n_quickpay, n_mumbai, 'REGISTERED_IN', 7),
  (n_amazon, n_bengaluru, 'REGISTERED_IN', 6),
  (n_saibaba, n_mumbai, 'REGISTERED_IN', 5),
  (n_swastik, n_delhi, 'REGISTERED_IN', 6),

  -- Individual → UPI (controls)
  (n_rajan, n_quickpay, 'CONTROLS', 8),
  (n_mukesh, n_amazon, 'CONTROLS', 7),
  (n_santosh, n_saibaba, 'CONTROLS', 7),
  (n_vikash, n_swastik, 'CONTROLS', 6),

  -- Inter-hub connections (the network)
  (n_jamtara, n_delhi, 'SHARED_INFRASTRUCTURE', 8),
  (n_jamtara, n_mumbai, 'SHARED_INFRASTRUCTURE', 7),
  (n_delhi, n_mumbai, 'SHARED_OPERATORS', 6),
  (n_mumbai, n_bengaluru, 'SHARED_INFRASTRUCTURE', 5)
  ON CONFLICT DO NOTHING;
END $$;
