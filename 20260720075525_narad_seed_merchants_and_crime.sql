
/*
# NARAD Seed Data — Flagged Merchants, Crime Feed, Districts Heatmap

Inserts:
- 10 flagged/unverified merchants for PRAMAAN pillar
- 25 crime feed alerts across India for dashboard
- 20 district heatmap entries for NARAD COMMAND
- Fraud network nodes and edges for SUTRA graph
*/

-- =============================================
-- FLAGGED MERCHANTS (PRAMAAN)
-- =============================================
INSERT INTO flagged_merchants (
  upi_id, shop_name, registered_city, registered_state,
  reports_count, trust_score, status, risk_level, fraud_type
) VALUES
('quickpay.fraud@paytm', 'Quick Pay Services', 'Mumbai', 'Maharashtra', 234, 5, 'FRAUDULENT', 'CRITICAL', 'Ghost merchant — collects payment, delivers nothing'),
('shreeji.fake@upi', 'Shreeji Electronics', 'Surat', 'Gujarat', 89, 12, 'SUSPICIOUS', 'HIGH', 'Counterfeit electronics — fake branded goods'),
('medineed.scam@ybl', 'MediNeed Pharmacy', 'Delhi', 'Delhi', 156, 8, 'FRAUDULENT', 'CRITICAL', 'Sells expired/fake medicines'),
('freshmart99@okaxis', 'Fresh Mart 99', 'Bengaluru', 'Karnataka', 45, 22, 'SUSPICIOUS', 'MEDIUM', 'Underweight goods, tampered scales'),
('goldenshop.upi@ibl', 'Golden Shop Jewellery', 'Jaipur', 'Rajasthan', 312, 3, 'FRAUDULENT', 'CRITICAL', 'Sells fake gold as hallmarked jewellery'),
('techzone.repair@paytm', 'TechZone Repair', 'Hyderabad', 'Telangana', 67, 18, 'SUSPICIOUS', 'HIGH', 'Installs spyware during device repair'),
('saibaba.trust@upi', 'Sai Baba Charitable Trust', 'Pune', 'Maharashtra', 198, 6, 'FRAUDULENT', 'CRITICAL', 'Fake charity — funds diverted'),
('amazondeal.fake@ybl', 'Amazon Deals India', 'Chennai', 'Tamil Nadu', 445, 2, 'FRAUDULENT', 'CRITICAL', 'Fake Amazon reseller — phishing site'),
('krishna.traders@okicici', 'Krishna Traders', 'Kolkata', 'West Bengal', 34, 31, 'SUSPICIOUS', 'MEDIUM', 'Duplicate/refurbished goods sold as new'),
('swastik.finance@paytm', 'Swastik Finance', 'Bhopal', 'Madhya Pradesh', 278, 4, 'FRAUDULENT', 'CRITICAL', 'Loan shark — charges 200% interest illegally')
ON CONFLICT DO NOTHING;

-- =============================================
-- CRIME FEED
-- =============================================
INSERT INTO crime_feed (
  alert_type, pillar, title, description,
  city, state, district, severity, amount_lost_cr, victims_count, reported_at
) VALUES
('SCAM_CALL', 'AAKASHVANI', 'Digital Arrest Gang Busted — 12 Arrested in Jamtara',
 'Jharkhand Police busted a major digital arrest operation. 12 suspects impersonating CBI officers arrested. Over 800 victims across 14 states identified.',
 'Jamtara', 'Jharkhand', 'Jamtara', 'CRITICAL', 4.7, 847, now() - interval '2 hours'),

('COUNTERFEIT', 'KUBER_SHIELD', 'Rs 500 Fake Notes Seized at Mumbai Railway Station',
 'Railway Protection Force seized 847 fake Rs 500 notes from a passenger. Notes were high-quality FICN with near-identical watermarks. RBI verification confirmed fake.',
 'Mumbai', 'Maharashtra', 'Mumbai City', 'HIGH', 0.04, 1, now() - interval '4 hours'),

('MERCHANT_FRAUD', 'PRAMAAN', 'Fake Gold Jewellery Shop Caught in Jaipur',
 'Consumer Protection Cell raided Golden Star Jewellers. Shop selling fake hallmarked gold. 312 customers defrauded. Shop registration found to be cloned.',
 'Jaipur', 'Rajasthan', 'Jaipur', 'CRITICAL', 2.3, 312, now() - interval '6 hours'),

('SCAM_CALL', 'AAKASHVANI', 'WhatsApp Account Takeover Wave in Delhi-NCR',
 'Cybercrime cell warns of mass WhatsApp account hijacking. Fraudsters send fake verification SMS. Once access gained, they message victim contacts for money.',
 'Delhi', 'Delhi', 'Central Delhi', 'HIGH', 0.89, 234, now() - interval '8 hours'),

('SMS_FRAUD', 'TRINETRA', 'Fake Income Tax Refund SMS Alert Issued',
 'I-T Department issues advisory: Fraudulent SMS claiming tax refund of Rs 9,870 circulating. Do not click links. Verify only on official incometax.gov.in',
 'Bengaluru', 'Karnataka', 'Bengaluru Urban', 'MEDIUM', 1.2, 567, now() - interval '10 hours'),

('SCAM_CALL', 'AAKASHVANI', 'UIDAI Impersonation Calls Spike in UP',
 'Massive spike in calls claiming Aadhaar linked to crime. Callers demand immediate payment or threaten service suspension. UIDAI confirms these calls are fraud.',
 'Lucknow', 'Uttar Pradesh', 'Lucknow', 'HIGH', 3.4, 892, now() - interval '12 hours'),

('COUNTERFEIT', 'KUBER_SHIELD', 'High-Quality Fake Rs 2000 Notes in Bengaluru',
 'Bengaluru Police seized 1,240 fake Rs 2000 notes from a currency exchange operation. Notes had magnetic ink but failed UV security strip test.',
 'Bengaluru', 'Karnataka', 'Bengaluru Urban', 'CRITICAL', 0.25, 3, now() - interval '14 hours'),

('MERCHANT_FRAUD', 'PRAMAAN', 'Fake Pharmacy Chain Shut Down in Delhi',
 'Delhi Health Department shut MediCare Plus — 6 branches selling expired and counterfeit medicines. 156 patients reported adverse reactions.',
 'Delhi', 'Delhi', 'South Delhi', 'CRITICAL', 1.8, 156, now() - interval '16 hours'),

('SCAM_CALL', 'AAKASHVANI', 'FedEx Parcel Scam Resurfaces in Maharashtra',
 'Cybercrime reports 445 new FedEx parcel scam complaints in 48 hours. Callers claim parcel with drugs intercepted at Mumbai airport. Demand clearance fee.',
 'Mumbai', 'Maharashtra', 'Mumbai Suburban', 'HIGH', 0.67, 445, now() - interval '18 hours'),

('SMS_FRAUD', 'TRINETRA', 'Fake SBI KYC SMS Campaign Detected',
 'SBI warns customers: Fraudulent SMS with link to fake SBI portal circulating. Over 2,341 KYC fraud attempts reported. Never click unverified links.',
 'Chennai', 'Tamil Nadu', 'Chennai', 'CRITICAL', 5.6, 2341, now() - interval '20 hours'),

('COUNTERFEIT', 'KUBER_SHIELD', 'FICN Network Busted in West Bengal',
 'NIA busted a FICN printing operation in Murshidabad. 12,000 fake Rs 500 notes and printing equipment seized. Three arrested, links to cross-border smuggling investigated.',
 'Kolkata', 'West Bengal', 'Murshidabad', 'CRITICAL', 0.6, 8, now() - interval '1 day'),

('SCAM_CALL', 'AAKASHVANI', 'Army Officer Romance Scam Victims in Haryana',
 'Gurugram Police reports 287 cases of romance fraud. Accused posed as army officers on matrimonial apps. Victims sent money ranging from Rs 5,000 to Rs 8 lakh.',
 'Gurugram', 'Haryana', 'Gurugram', 'HIGH', 1.1, 287, now() - interval '1 day'),

('MERCHANT_FRAUD', 'PRAMAAN', 'Fake Amazon Reseller Phishing Operation',
 'Cybercrime cell shuts fake Amazon India website. 445 orders placed, no delivery made. Payment gateway data compromised for 1,200 users.',
 'Chennai', 'Tamil Nadu', 'Chennai', 'CRITICAL', 3.2, 1200, now() - interval '2 days'),

('SMS_FRAUD', 'TRINETRA', 'Electricity Bill Scam Targeting AP Consumers',
 'APSEB issues warning: Fraudulent calls threatening disconnection. Scammers demand payment to unknown UPI IDs. 445 complaints from Hyderabad and Vijayawada.',
 'Hyderabad', 'Telangana', 'Hyderabad', 'MEDIUM', 0.45, 445, now() - interval '2 days'),

('SCAM_CALL', 'AAKASHVANI', 'KBC Lottery Scam Hits Bihar Hard',
 'Bihar Police investigates 1,876 KBC lottery fraud complaints. Victims paid processing fees between Rs 500-5,000. Total loss estimated at Rs 1.1 crore.',
 'Patna', 'Bihar', 'Patna', 'HIGH', 1.1, 1876, now() - interval '3 days'),

('COUNTERFEIT', 'KUBER_SHIELD', 'Fake Rs 500 Notes at Vegetable Market',
 'Consumer protection volunteers detected 34 fake Rs 500 notes in Azadpur vegetable market. Notes lacked correct watermark. Traders warned.',
 'Delhi', 'Delhi', 'North West Delhi', 'MEDIUM', 0.017, 18, now() - interval '3 days'),

('MERCHANT_FRAUD', 'PRAMAAN', 'Loan Shark App Exposed in MP',
 'Bhopal Cybercrime arrests operator of Swastik Finance app. App charged 200% interest. Used morphed photos to blackmail defaulters. 278 victims.',
 'Bhopal', 'Madhya Pradesh', 'Bhopal', 'CRITICAL', 4.5, 278, now() - interval '4 days'),

('SMS_FRAUD', 'TRINETRA', 'Insurance Bonus Fraud Alert — LIC Warns',
 'LIC issues advisory: Fraudsters call claiming policy bonus ready. Ask for tax payment of Rs 1,500-5,000 to release amount. 678 complaints in Q3.',
 'Chennai', 'Tamil Nadu', 'Chennai', 'MEDIUM', 0.78, 678, now() - interval '4 days'),

('SCAM_CALL', 'AAKASHVANI', 'Customs Scam Targets Online Shoppers in WB',
 'Kolkata Cybercrime warns of customs scam targeting international online shoppers. 634 cases. Callers demand duty payment for fake package clearance.',
 'Kolkata', 'West Bengal', 'Kolkata', 'HIGH', 1.9, 634, now() - interval '5 days'),

('MERCHANT_FRAUD', 'PRAMAAN', 'Tech Repair Shop Installing Spyware',
 'Hyderabad Cybercrime arrests TechZone Repair owner. Found installing keyloggers on phones during repair. Banking data of 67 customers compromised.',
 'Hyderabad', 'Telangana', 'Hyderabad', 'CRITICAL', 2.1, 67, now() - interval '5 days'),

('SCAM_CALL', 'AAKASHVANI', 'Investment Fraud Gang Caught in Ahmedabad',
 'SEBI and Ahmedabad Police bust fake stock advisory group. 789 victims across Gujarat and Maharashtra lost total of Rs 12 crore.',
 'Ahmedabad', 'Gujarat', 'Ahmedabad', 'CRITICAL', 12.0, 789, now() - interval '6 days'),

('COUNTERFEIT', 'KUBER_SHIELD', 'Fake Note Syndicate Busted in Rajasthan',
 'Jaipur Police arrested 5 members of FICN distribution network. 8,400 fake Rs 200 and Rs 500 notes seized along with bulk cash counting machines.',
 'Jaipur', 'Rajasthan', 'Jaipur', 'HIGH', 0.42, 5, now() - interval '7 days'),

('SMS_FRAUD', 'TRINETRA', 'Phishing SMS Imitating HDFC Bank',
 'HDFC Bank warns customers of phishing campaign. Fake SMS with official-looking links. 1,100 complaints in 72 hours. Never share OTP with anyone.',
 'Mumbai', 'Maharashtra', 'Mumbai City', 'HIGH', 2.8, 1100, now() - interval '7 days'),

('SCAM_CALL', 'AAKASHVANI', 'Aadhaar Crime Link Scam Sweeps Delhi',
 'UIDAI and Delhi Police joint advisory: Mass calls claiming Aadhaar linked to 14 criminal cases. 892 complaints. Callers demand payment to clear name.',
 'Delhi', 'Delhi', 'East Delhi', 'CRITICAL', 6.7, 892, now() - interval '8 days'),

('MERCHANT_FRAUD', 'PRAMAAN', 'Fake Charitable Trust UPI Fraud',
 'Mumbai Police arrested Sai Baba Charitable Trust operators. Trust was collecting donations via UPI but had no registration. Rs 3.1 crore collected and diverted.',
 'Mumbai', 'Maharashtra', 'Mumbai City', 'CRITICAL', 3.1, 198, now() - interval '8 days')
ON CONFLICT DO NOTHING;

-- =============================================
-- DISTRICTS HEATMAP (NARAD COMMAND)
-- =============================================
INSERT INTO districts_heatmap (
  district, state, lat, lng,
  alert_count, counterfeit_count, merchant_flags, scam_call_count,
  total_loss_cr, priority_level
) VALUES
('Jamtara', 'Jharkhand', 23.97, 86.80, 892, 12, 8, 847, 18.4, 'CRITICAL'),
('Mumbai City', 'Maharashtra', 18.94, 72.84, 445, 89, 67, 312, 24.7, 'CRITICAL'),
('Delhi Central', 'Delhi', 28.64, 77.22, 567, 124, 89, 678, 31.2, 'CRITICAL'),
('Bengaluru Urban', 'Karnataka', 12.97, 77.59, 334, 67, 45, 289, 16.8, 'HIGH'),
('Jaipur', 'Rajasthan', 26.91, 75.79, 278, 156, 34, 198, 12.3, 'HIGH'),
('Lucknow', 'Uttar Pradesh', 26.85, 80.94, 312, 34, 56, 456, 14.5, 'HIGH'),
('Hyderabad', 'Telangana', 17.36, 78.47, 234, 45, 78, 234, 10.9, 'HIGH'),
('Patna', 'Bihar', 25.59, 85.13, 198, 23, 12, 312, 8.7, 'HIGH'),
('Chennai', 'Tamil Nadu', 13.08, 80.27, 189, 34, 56, 178, 9.4, 'MEDIUM'),
('Kolkata', 'West Bengal', 22.57, 88.36, 267, 78, 34, 234, 13.6, 'HIGH'),
('Ahmedabad', 'Gujarat', 23.02, 72.57, 156, 45, 23, 189, 15.2, 'HIGH'),
('Bhopal', 'Madhya Pradesh', 23.25, 77.40, 145, 23, 45, 167, 7.8, 'MEDIUM'),
('Gurugram', 'Haryana', 28.46, 77.02, 178, 34, 23, 234, 11.3, 'HIGH'),
('Pune', 'Maharashtra', 18.52, 73.85, 134, 56, 34, 156, 9.1, 'MEDIUM'),
('Surat', 'Gujarat', 21.17, 72.83, 112, 34, 67, 123, 6.7, 'MEDIUM'),
('Ranchi', 'Jharkhand', 23.34, 85.31, 234, 12, 8, 345, 12.1, 'HIGH'),
('Indore', 'Madhya Pradesh', 22.71, 75.85, 89, 23, 34, 112, 4.5, 'MEDIUM'),
('Kochi', 'Kerala', 9.93, 76.26, 67, 12, 23, 89, 3.2, 'LOW'),
('Chandigarh', 'Punjab', 30.73, 76.78, 78, 23, 12, 98, 3.8, 'LOW'),
('Visakhapatnam', 'Andhra Pradesh', 17.68, 83.21, 89, 34, 12, 78, 4.1, 'MEDIUM')
ON CONFLICT DO NOTHING;
