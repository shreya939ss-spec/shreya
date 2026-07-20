
/*
# NARAD Seed Data — Flagged Phone Numbers

Inserts 15 hypothetical fraudster profiles with face image URLs (Pexels stock photos
used as suspect stand-ins for prototype purposes), scam type, scripts, and risk metadata.

These are the specific numbers shown in AAKASHVANI and TRINETRA as pre-known scam numbers.
All numbers, names, and details are ENTIRELY FICTIONAL for hackathon demonstration purposes.
*/

INSERT INTO flagged_numbers (
  phone_number, scam_type, scam_category, operator_name, origin_state,
  reports_count, risk_level, suspect_name, suspect_alias,
  suspect_face_url, suspect_age, suspect_description,
  known_scripts, last_reported_city, last_reported_state,
  first_reported_at, last_reported_at
) VALUES
(
  '+919876543210', 'Digital Arrest Scam', 'CBI Impersonation',
  'Jio', 'Jharkhand', 847, 'CRITICAL',
  'Rajan Mehta (Hypothetical)', 'CBI Officer Sharma',
  'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300',
  34, 'Operates from Jamtara district. Claims to be CBI officer. Uses VOIP spoofing.',
  ARRAY['Your parcel seized at customs', 'You must pay fine to avoid arrest', 'This is CBI headquarters speaking'],
  'Mumbai', 'Maharashtra',
  now() - interval '180 days', now() - interval '2 hours'
),
(
  '+918765432109', 'Digital Arrest Scam', 'ED Officer Fraud',
  'Airtel', 'Jharkhand', 1203, 'CRITICAL',
  'Vikash Kumar (Hypothetical)', 'ED Deputy Director',
  'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=300',
  29, 'Part of Jamtara cybercrime syndicate. Poses as Enforcement Directorate officer.',
  ARRAY['Your bank account linked to money laundering', 'Immediate digital arrest issued', 'Do not tell anyone or face consequences'],
  'Delhi', 'Delhi',
  now() - interval '220 days', now() - interval '5 hours'
),
(
  '+917654321098', 'Digital Arrest Scam', 'Customs Department Scam',
  'Vi', 'West Bengal', 634, 'HIGH',
  'Suresh Pal (Hypothetical)', 'Customs Inspector Verma',
  'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300',
  41, 'Claims international parcel with drugs intercepted. Demands clearance fee.',
  ARRAY['Your DHL parcel contains illegal items', 'Pay clearance charge of Rs 15000', 'Warrant issued in your name'],
  'Kolkata', 'West Bengal',
  now() - interval '90 days', now() - interval '1 day'
),
(
  '+919988776655', 'Parcel Scam', 'FedEx/DHL Impersonation',
  'BSNL', 'Rajasthan', 412, 'HIGH',
  'Anwar Khan (Hypothetical)', 'FedEx Agent',
  'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=300',
  26, 'Spoofs courier company numbers. Claims package held at customs.',
  ARRAY['Your package is on hold', 'Pay Rs 5000 to release parcel', 'Call back immediately for resolution'],
  'Jaipur', 'Rajasthan',
  now() - interval '45 days', now() - interval '3 hours'
),
(
  '+918899001122', 'KYC Scam', 'Bank KYC Update Fraud',
  'Airtel', 'Uttar Pradesh', 2341, 'CRITICAL',
  'Deepak Sharma (Hypothetical)', 'SBI Customer Care',
  'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=300',
  33, 'Largest operation — calls SBI customers claiming KYC expiry. Steals OTP.',
  ARRAY['Your SBI account will be blocked in 24 hours', 'Update KYC now to avoid suspension', 'Share OTP received on registered mobile'],
  'Lucknow', 'Uttar Pradesh',
  now() - interval '300 days', now() - interval '30 minutes'
),
(
  '+917788990011', 'Investment Scam', 'Stock Market Fraud',
  'Jio', 'Gujarat', 789, 'HIGH',
  'Paresh Modi (Hypothetical)', 'SEBI Certified Advisor',
  'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=300',
  38, 'Poses as SEBI certified advisor. Promises 300% returns on stock tips.',
  ARRAY['Guaranteed 300% return in 30 days', 'Exclusive stock tip from insider', 'Join our Telegram for free signals'],
  'Ahmedabad', 'Gujarat',
  now() - interval '120 days', now() - interval '6 hours'
),
(
  '+919001122334', 'Lottery Scam', 'KBC/Government Lottery',
  'Vi', 'Bihar', 1876, 'HIGH',
  'Rahul Singh (Hypothetical)', 'KBC Lottery Manager',
  'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=300',
  31, 'KBC lottery scam. Claims victim won Rs 25 lakh. Asks processing fee.',
  ARRAY['Congratulations! You won Rs 25 lakh in KBC', 'Pay Rs 2000 processing fee to claim prize', 'Keep this confidential until claim is processed'],
  'Patna', 'Bihar',
  now() - interval '500 days', now() - interval '1 hour'
),
(
  '+918112233445', 'Tech Support Scam', 'Microsoft/Google Impersonation',
  'Airtel', 'Jharkhand', 543, 'MEDIUM',
  'Naveen Tiwari (Hypothetical)', 'Microsoft Security Team',
  'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=300',
  27, 'Claims computer has virus. Gets remote access via AnyDesk and steals banking data.',
  ARRAY['Your computer is infected with virus', 'Microsoft detected suspicious activity', 'Install this software to fix the issue'],
  'Ranchi', 'Jharkhand',
  now() - interval '60 days', now() - interval '2 days'
),
(
  '+917223344556', 'WhatsApp Scam', 'Account Takeover',
  'Jio', 'Madhya Pradesh', 934, 'HIGH',
  'Rakesh Verma (Hypothetical)', 'WhatsApp Support',
  'https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg?auto=compress&cs=tinysrgb&w=300',
  24, 'Sends fake WhatsApp verification links. Hijacks accounts to scam contacts.',
  ARRAY['Your WhatsApp subscription has expired', 'Share verification code to renew account', 'Your account will be deleted in 1 hour'],
  'Bhopal', 'Madhya Pradesh',
  now() - interval '30 days', now() - interval '4 hours'
),
(
  '+919334455667', 'Insurance Scam', 'LIC Policy Fraud',
  'BSNL', 'Tamil Nadu', 678, 'MEDIUM',
  'Muthusamy R (Hypothetical)', 'LIC Senior Agent',
  'https://images.pexels.com/photos/1139743/pexels-photo-1139743.jpeg?auto=compress&cs=tinysrgb&w=300',
  45, 'Claims LIC policy bonus available. Asks for advance payment to release bonus.',
  ARRAY['Your LIC policy bonus of Rs 50000 is ready', 'Pay Rs 1500 as income tax to release amount', 'Last date to claim is tomorrow'],
  'Chennai', 'Tamil Nadu',
  now() - interval '75 days', now() - interval '8 hours'
),
(
  '+918445566778', 'Police Impersonation', 'Fake Police Station Call',
  'Airtel', 'Maharashtra', 1456, 'CRITICAL',
  'Santosh Bhosale (Hypothetical)', 'ACP Desai',
  'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=300',
  36, 'Impersonates senior police officer. Claims warrant against family member.',
  ARRAY['I am calling from Thane Police Station', 'Your son/daughter arrested for drug case', 'Pay Rs 50000 for bail immediately'],
  'Pune', 'Maharashtra',
  now() - interval '150 days', now() - interval '45 minutes'
),
(
  '+917556677889', 'Romance Scam', 'Matrimonial Fraud',
  'Jio', 'Haryana', 287, 'MEDIUM',
  'Kuldeep Yadav (Hypothetical)', 'Army Officer Captain',
  'https://images.pexels.com/photos/775358/pexels-photo-775358.jpeg?auto=compress&cs=tinysrgb&w=300',
  32, 'Poses as Army officer on matrimonial sites. Builds relationship then asks for money.',
  ARRAY['I am posted at Siachen border', 'Need money to travel for our meeting', 'Send money via Western Union — cannot use bank'],
  'Gurugram', 'Haryana',
  now() - interval '200 days', now() - interval '12 hours'
),
(
  '+919667788990', 'UPI Scam', 'Collect Request Fraud',
  'Vi', 'Karnataka', 1102, 'HIGH',
  'Prakash Nair (Hypothetical)', 'OLX Buyer',
  'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=300',
  28, 'Sends UPI collect requests disguised as payment receipts. Victim accepts and loses money.',
  ARRAY['I have sent the payment, please accept', 'Click on UPI request to receive money', 'Army officer, will pay extra for quick delivery'],
  'Bengaluru', 'Karnataka',
  now() - interval '40 days', now() - interval '2 hours'
),
(
  '+918778899001', 'Aadhaar Scam', 'UIDAI Impersonation',
  'Airtel', 'Delhi', 892, 'CRITICAL',
  'Mukesh Gupta (Hypothetical)', 'UIDAI Officer',
  'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300',
  39, 'Claims Aadhaar used in criminal activity. Threatens suspension of all services.',
  ARRAY['Your Aadhaar linked to 14 mobile numbers in crime case', 'UIDAI will suspend your Aadhaar in 2 hours', 'Press 1 to speak with UIDAI officer'],
  'Delhi', 'Delhi',
  now() - interval '85 days', now() - interval '20 minutes'
),
(
  '+917889900112', 'Electricity Scam', 'Utility Bill Disconnection',
  'Jio', 'Andhra Pradesh', 445, 'MEDIUM',
  'Srinivas Reddy (Hypothetical)', 'APSEB Executive',
  'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300',
  30, 'Threatens electricity disconnection. Asks to pay via UPI to unknown number.',
  ARRAY['Your electricity will be disconnected in 2 hours', 'Pay pending bill of Rs 3200 immediately', 'Call our technician to avoid disconnection'],
  'Hyderabad', 'Telangana',
  now() - interval '55 days', now() - interval '6 hours'
)
ON CONFLICT (phone_number) DO NOTHING;
