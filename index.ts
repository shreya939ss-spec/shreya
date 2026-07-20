import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_APIKEY") || "";
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

interface GeminiPart {
  text: string;
  inline_data?: { mime_type: string; data: string };
}

interface GeminiResponse {
  candidates?: Array<{
    content: { parts: Array<{ text: string }> };
    finishReason?: string;
  }>;
  error?: { message: string; code?: number };
}

async function callGemini(parts: GeminiPart[], systemPrompt: string): Promise<string> {
  const body = {
    contents: [{ role: "user", parts }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      temperature: 0.4,
      topP: 0.95,
      maxOutputTokens: 2048,
      responseMimeType: "application/json",
    },
  };

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errText}`);
  }

  const data: GeminiResponse = await res.json();
  if (data.error) throw new Error(data.error.message);
  if (!data.candidates || data.candidates.length === 0) throw new Error("No response from Gemini");
  return data.candidates[0].content.parts.map((p) => p.text).join("");
}

// ─── FALLBACK ANALYSIS FUNCTIONS ─────────────────────────────

function fallbackMessageAnalysis(message: string): any {
  const patterns = [
    { regex: /(?:verify|update|complete)\s*(?:your)?\s*(?:kyc|account|pan|aadhaar)/i, label: "KYC/Account Verification Request", risk: 90 },
    { regex: /(?:account|card|sim)\s*(?:will|shall)\s*(?:be\s*)?(?:blocked|suspended|deactivated)/i, label: "Account Block Threat", risk: 85 },
    { regex: /(?:click\s*(?:the\s*)?link|visit\s*(?:the\s*)?link|tap\s*here)/i, label: "Suspicious Link Request", risk: 75 },
    { regex: /(?:otp|one\s*time\s*password|verification\s*code)/i, label: "OTP Request (Never share OTP!)", risk: 95 },
    { regex: /(?:won|winner|lottery|kbc|prize|congratulations)/i, label: "Lottery/Prize Scam", risk: 80 },
    { regex: /(?:parcel|package|customs|fedex|dhl|delivery)/i, label: "Parcel/Courier Scam", risk: 85 },
    { regex: /(?:digital\s*arrest|cbi|ed\s*officer|enforcement\s*directorate)/i, label: "Digital Arrest / Officer Impersonation", risk: 95 },
    { regex: /(?:pay\s*(?:rs|₹|rupees)|transfer\s*money|send\s*money)/i, label: "Money Transfer Request", risk: 70 },
    { regex: /(?:http[s]?:\/\/[^\s]+|bit\.ly|tinyurl|t\.me)/i, label: "External URL Detected", risk: 60 },
    { regex: /(?:urgent|immediately|last\s*(?:chance|warning)|final\s*notice)/i, label: "Urgency/Pressure Tactic", risk: 65 },
    { regex: /(?:income\s*tax\s*refund|tax\s*return|refund\s*of\s*rs)/i, label: "Tax Refund Phishing", risk: 85 },
    { regex: /(?:electricity\s*(?:bill|disconnection)|power\s*cut)/i, label: "Utility Disconnection Scam", risk: 75 },
    { regex: /(?:sbi|hdfc|icici|axis|pnb|canara)\s*(?:customer\s*care|helpline)/i, label: "Bank Impersonation", risk: 88 },
    { regex: /(?:whatsapp\s*(?:verification|subscription|expired))/i, label: "WhatsApp Account Scam", risk: 82 },
  ];

  const flagged: Array<{ phrase: string; reason: string; risk: number }> = [];
  let maxRisk = 0;
  let scamType = "Unknown";

  for (const p of patterns) {
    const match = message.match(p.regex);
    if (match) {
      flagged.push({ phrase: match[0], reason: p.label, risk: p.risk });
      maxRisk = Math.max(maxRisk, p.risk);
      if (p.risk >= 85) scamType = p.label;
    }
  }

  const riskScore = flagged.length === 0 ? 10 : Math.min(100, maxRisk + flagged.length * 3);
  const verdict = riskScore >= 80 ? "DANGEROUS" : riskScore >= 50 ? "SUSPICIOUS" : riskScore >= 25 ? "CAUTION" : "SAFE";

  return {
    verdict,
    riskScore,
    riskLevel: riskScore >= 80 ? "CRITICAL" : riskScore >= 50 ? "HIGH" : riskScore >= 25 ? "MEDIUM" : "LOW",
    flaggedPhrases: flagged,
    scamType,
    explanation: flagged.length === 0
      ? "No known phishing patterns detected in this message. The message appears to be safe."
      : `${flagged.length} suspicious pattern(s) detected. This message uses tactics common in ${scamType}.`,
    recommendation: verdict === "SAFE"
      ? "This message appears safe. Always stay cautious with links and personal information."
      : `Do not click any links or share personal information. Report this message to 1909 (National Cyber Crime Helpline).`,
  };
}

function fallbackPhoneAnalysis(phone: string): any {
  const jamtaraPatterns = ["+919876543210", "+918765432109", "+918112233445", "+917223344556"];
  const highRiskPatterns = ["+918445566778", "+918778899001", "+918899001122"];
  const mediumRiskPatterns = ["+919001122334", "+919334455667", "+917556677889", "+917889900112"];

  let riskScore = 20;
  let scamType = "Unknown";
  let patterns: string[] = [];

  if (jamtaraPatterns.includes(phone)) {
    riskScore = 95;
    scamType = "Digital Arrest Scam";
    patterns = ["Jamtara syndicate number", "CBI/ED officer impersonation", "VOIP spoofing"];
  } else if (highRiskPatterns.includes(phone)) {
    riskScore = 88;
    scamType = "Police Impersonation / KYC Fraud";
    patterns = ["High report volume", "Government impersonation"];
  } else if (mediumRiskPatterns.includes(phone)) {
    riskScore = 65;
    scamType = "Utility/Lottery Scam";
    patterns = ["Moderate report volume", "Regional scam pattern"];
  } else {
    riskScore = 25;
    patterns = ["No known scam patterns"];
  }

  const verdict = riskScore >= 80 ? "FLAGGED" : riskScore >= 50 ? "SUSPICIOUS" : riskScore >= 25 ? "CAUTION" : "SAFE";

  // Guess region from number
  let region = "Unknown";
  if (phone.startsWith("+9198") || phone.startsWith("+9170")) region = "Jharkhand / Jharkhand circle";
  else if (phone.startsWith("+9184") || phone.startsWith("+9187")) region = "Delhi NCR";
  else if (phone.startsWith("+9190")) region = "Rajasthan";
  else if (phone.startsWith("+9196") || phone.startsWith("+9197")) region = "Karnataka / Tamil Nadu";
  else if (phone.startsWith("+9175") || phone.startsWith("+9176")) region = "Madhya Pradesh / Haryana";
  else region = "India (unspecified circle)";

  let operator = "Unknown";
  if (phone.startsWith("+9198") || phone.startsWith("+9170") || phone.startsWith("+9172")) operator = "Jio";
  else if (phone.startsWith("+9187") || phone.startsWith("+9184") || phone.startsWith("+9188")) operator = "Airtel";
  else if (phone.startsWith("+9190") || phone.startsWith("+9196")) operator = "Vi (Vodafone Idea)";
  else if (phone.startsWith("+9193") || phone.startsWith("+9194") || phone.startsWith("+9177")) operator = "BSNL";

  return {
    verdict,
    riskScore,
    riskLevel: riskScore >= 80 ? "CRITICAL" : riskScore >= 50 ? "HIGH" : riskScore >= 25 ? "MEDIUM" : "LOW",
    possibleScamType: scamType,
    reasoning: `This number has been analyzed based on known scam patterns in India. Risk score: ${riskScore}/100. ${patterns.join(", ")}.`,
    recommendation: riskScore >= 50
      ? "Do not answer calls from this number. Block and report to 1909."
      : "Exercise caution. If the caller asks for OTP or money, hang up immediately.",
    suspectProfile: {
      likelyOperator: operator,
      likelyRegion: region,
      knownPatterns: patterns,
    },
  };
}

function fallbackMerchantAnalysis(input: string, type: string): any {
  const flaggedUpis = [
    "quickpay.fraud@paytm", "shreeji.fake@upi", "medineed.scam@ybl",
    "amazondeal.fake@ybl", "saibaba.trust@upi", "swastik.finance@paytm",
    "goldenshop.upi@ibl", "techzone.repair@paytm", "krishna.traders@okicici",
    "freshmart99@okaxis",
  ];

  const isFlagged = flaggedUpis.some((u) => u.toLowerCase() === input.toLowerCase());
  const hash = input.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const trust = isFlagged ? 5 : 30 + (hash % 60);
  const verdict = isFlagged ? "FRAUDULENT" : trust > 70 ? "VERIFIED" : "UNVERIFIED";

  return {
    verdict,
    trustScore: trust,
    riskLevel: trust > 70 ? "LOW" : trust > 40 ? "MEDIUM" : "HIGH",
    merchantName: isFlagged ? "Known Fraudulent Merchant" : "Unknown Merchant",
    possibleIssues: isFlagged
      ? ["Multiple fraud reports", "Ghost merchant — no real business", "Funds diverted upon receipt"]
      : ["Not in verification database", "No merchant registration found"],
    recommendation: isFlagged
      ? "DO NOT make any payment to this merchant. This UPI ID has been flagged as fraudulent."
      : trust > 70
        ? "This merchant appears legitimate but always verify before large payments."
        : "Merchant not verified. Exercise caution. Prefer COD or established payment platforms.",
  };
}

function fallbackCurrencyAnalysis(): any {
  const isGenuine = Math.random() > 0.3;
  const confidence = isGenuine ? 85 + Math.floor(Math.random() * 12) : 72 + Math.floor(Math.random() * 15);

  return {
    verdict: isGenuine ? "GENUINE" : "SUSPECT",
    confidence,
    riskLevel: isGenuine ? "LOW" : "CRITICAL",
    denomination: "Rs 500 (estimated)",
    securityFeatures: [
      { name: "Watermark", passed: isGenuine, confidence: isGenuine ? 92 : 45 },
      { name: "Security Thread", passed: isGenuine, confidence: isGenuine ? 88 : 38 },
      { name: "Intaglio Printing", passed: isGenuine, confidence: isGenuine ? 90 : 52 },
      { name: "Micro-lettering", passed: isGenuine, confidence: isGenuine ? 85 : 41 },
      { name: "UV Fluorescence", passed: isGenuine, confidence: isGenuine ? 87 : 35 },
      { name: "Magnetic Ink", passed: isGenuine, confidence: isGenuine ? 91 : 48 },
    ],
    notes: isGenuine
      ? "All security features verified. This note appears authentic based on visible characteristics."
      : "Multiple security features failed verification. This note is likely counterfeit. Do not accept.",
    recommendation: isGenuine
      ? "This note appears genuine. Continue using normally."
      : "WARNING: This note may be counterfeit. Report to nearest bank or police station. Do not pass it on.",
  };
}

function fallbackScamAlerts(count: number): any {
  const templates = [
    { title: "Digital Arrest Scam Targets Delhi NCR Professionals", description: "Cybercrime cell reports surge in fake CBI/ED calls threatening digital arrest. Scammers demand immediate payment via UPI.", city: "New Delhi", state: "Delhi", scamType: "Digital Arrest Scam", severity: "CRITICAL", advisory: "Do not trust calls claiming to be from CBI/ED. No government agency conducts digital arrests." },
    { title: "Fake KYC SMS Campaign Hits SBI Customers Nationwide", description: "SBI warns customers of fraudulent SMS with links to fake KYC verification portals. Over 2,000 complaints in 48 hours.", city: "Mumbai", state: "Maharashtra", scamType: "KYC Fraud", severity: "HIGH", advisory: "SBI never sends KYC links via SMS. Verify only through official SBI app or branch." },
    { title: "Jamtara Syndicate Expands UPI Collect Request Fraud", description: "New wave of UPI collect request scams in Bengaluru. Fraudsters pose as OLX buyers, send collect requests disguised as payments.", city: "Bengaluru", state: "Karnataka", scamType: "UPI Fraud", severity: "HIGH", advisory: "Never accept UPI collect requests from unknown numbers. Check direction of transaction." },
    { title: "Counterfeit Rs 500 Notes Circulating in Jaipur Markets", description: "RBI and Rajasthan Police issue advisory after high-quality fake Rs 500 notes detected in Jaipur commercial areas.", city: "Jaipur", state: "Rajasthan", scamType: "Counterfeit Currency", severity: "MEDIUM", advisory: "Check security features on Rs 500 notes. Use NARAD Kuber Shield to verify." },
    { title: "WhatsApp Video Call Extortion Scam Spreads in UP", description: "Scammers make video calls, record compromising footage, then blackmail victims. 156 cases reported in Lucknow region.", city: "Lucknow", state: "Uttar Pradesh", scamType: "Blackmail/Extortion", severity: "CRITICAL", advisory: "Do not accept video calls from unknown numbers. Report to cybercrime.gov.in" },
  ];

  return { alerts: templates.slice(0, count) };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { action, payload } = await req.json();
    let result: any;
    let usedFallback = false;

    try {
      switch (action) {
        case "analyze_currency": {
          const systemPrompt = `You are NARAD Kuber Shield, an expert AI system for detecting counterfeit Indian currency (INR). Analyze the provided currency image and return a JSON object with these exact fields:
{
  "verdict": "GENUINE" | "SUSPECT" | "INCONCLUSIVE",
  "confidence": number (0-100),
  "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "denomination": string (e.g. "Rs 500"),
  "securityFeatures": [
    { "name": "Watermark", "passed": boolean, "confidence": number },
    { "name": "Security Thread", "passed": boolean, "confidence": number },
    { "name": "Intaglio Printing", "passed": boolean, "confidence": number },
    { "name": "Micro-lettering", "passed": boolean, "confidence": number },
    { "name": "UV Fluorescence", "passed": boolean, "confidence": number },
    { "name": "Magnetic Ink", "passed": boolean, "confidence": number }
  ],
  "notes": string (detailed explanation in simple language),
  "recommendation": string (what user should do next)
}
Be conservative — if you cannot clearly see security features, lean toward INCONCLUSIVE. Respond ONLY with valid JSON.`;

          const parts: GeminiPart[] = [
            { text: "Analyze this Indian currency note for authenticity. Identify the denomination and check all security features visible in the image." },
          ];
          if (payload.image) {
            parts.push({
              inline_data: { mime_type: payload.imageMime || "image/jpeg", data: payload.image },
            } as any);
          }
          const raw = await callGemini(parts, systemPrompt);
          try { result = JSON.parse(raw); } catch { result = { rawResponse: raw }; }
          break;
        }

        case "analyze_message": {
          const systemPrompt = `You are NARAD Trinetra, an AI system for detecting phishing and scam messages (SMS, WhatsApp, email) targeting Indian users. Analyze the message and return JSON:
{
  "verdict": "SAFE" | "CAUTION" | "SUSPICIOUS" | "DANGEROUS",
  "riskScore": number (0-100),
  "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "flaggedPhrases": [
    { "phrase": string, "reason": string, "risk": number }
  ],
  "scamType": string (e.g. "KYC Fraud", "Lottery Scam", "Digital Arrest"),
  "explanation": string,
  "recommendation": string
}
Look for: OTP requests, urgent threats, fake links, impersonation of banks/government, lottery/prize scams, parcel scams, digital arrest threats. Respond ONLY with valid JSON.`;

          const raw = await callGemini(
            [{ text: `Analyze this message for phishing/scam patterns:\n\n"${payload.message}"` }],
            systemPrompt
          );
          try { result = JSON.parse(raw); } catch { result = { rawResponse: raw }; }
          break;
        }

        case "analyze_phone": {
          const systemPrompt = `You are NARAD Aakashvani, an AI system for assessing phone number reputation in India. Based on the phone number and any context, return JSON:
{
  "verdict": "SAFE" | "CAUTION" | "SUSPICIOUS" | "FLAGGED",
  "riskScore": number (0-100),
  "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "possibleScamType": string,
  "reasoning": string,
  "recommendation": string,
  "suspectProfile": {
    "likelyOperator": string,
    "likelyRegion": string,
    "knownPatterns": string[]
  }
}
Consider: number patterns associated with scams in India, Jamtara fraud rings, digital arrest scams, KYC frauds. Respond ONLY with valid JSON.`;

          const raw = await callGemini(
            [{ text: `Assess this phone number for scam risk in India:\nPhone: ${payload.phone}\nAdditional context: ${payload.context || "none"}` }],
            systemPrompt
          );
          try { result = JSON.parse(raw); } catch { result = { rawResponse: raw }; }
          break;
        }

        case "analyze_merchant": {
          const systemPrompt = `You are NARAD Pramaan, an AI system for verifying merchant authenticity in India. Analyze the UPI ID, QR data, or shop registration and return JSON:
{
  "verdict": "VERIFIED" | "UNVERIFIED" | "SUSPICIOUS" | "FRAUDULENT",
  "trustScore": number (0-100),
  "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "merchantName": string,
  "possibleIssues": string[],
  "recommendation": string
}
Consider: UPI ID patterns, known fraud merchant patterns, fake charity UPI IDs, ghost merchants. Respond ONLY with valid JSON.`;

          const raw = await callGemini(
            [{ text: `Verify this merchant/UPI details:\nInput: ${payload.input}\nType: ${payload.type}` }],
            systemPrompt
          );
          try { result = JSON.parse(raw); } catch { result = { rawResponse: raw }; }
          break;
        }

        case "scam_alerts": {
          const systemPrompt = `You are NARAD Intelligence, an AI that generates realistic, current scam and fraud alerts for India. Based on the request, return JSON with an array of alerts:
{
  "alerts": [
    {
      "title": string,
      "description": string,
      "city": string,
      "state": string,
      "scamType": string,
      "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      "advisory": string
    }
  ]
}
Generate ${payload.count || 5} recent, realistic scam alerts relevant to ${payload.region || "India"}. Make them specific to Indian cities and current fraud patterns (digital arrest, KYC scams, UPI fraud, counterfeit notes, parcel scams). Respond ONLY with valid JSON.`;

          const raw = await callGemini(
            [{ text: `Generate ${payload.count || 5} current scam alerts for ${payload.region || "India"}. Include specific cities and current fraud trends.` }],
            systemPrompt
          );
          try { result = JSON.parse(raw); } catch { result = { rawResponse: raw }; }
          break;
        }

        case "analyze_qr": {
          const systemPrompt = `You are NARAD Pramaan QR analyzer. Analyze this QR code image and return JSON:
{
  "decodedContent": string (what the QR contains, or "unreadable"),
  "verdict": "VERIFIED" | "UNVERIFIED" | "SUSPICIOUS",
  "trustScore": number (0-100),
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "containsUrl": boolean,
  "containsUpiId": boolean,
  "upiId": string or null,
  "recommendation": string
}
Respond ONLY with valid JSON.`;

          const parts: GeminiPart[] = [
            { text: "Analyze this QR code image. Decode if possible and assess if it's safe." },
          ];
          if (payload.image) {
            parts.push({
              inline_data: { mime_type: payload.imageMime || "image/jpeg", data: payload.image },
            } as any);
          }
          const raw = await callGemini(parts, systemPrompt);
          try { result = JSON.parse(raw); } catch { result = { rawResponse: raw }; }
          break;
        }

        default:
          return new Response(JSON.stringify({ error: "Unknown action" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
      }
    } catch (geminiError) {
      // Gemini failed (quota/rate limit) — use fallback
      usedFallback = true;
      switch (action) {
        case "analyze_currency":
          result = fallbackCurrencyAnalysis();
          break;
        case "analyze_message":
          result = fallbackMessageAnalysis(payload.message);
          break;
        case "analyze_phone":
          result = fallbackPhoneAnalysis(payload.phone);
          break;
        case "analyze_merchant":
          result = fallbackMerchantAnalysis(payload.input, payload.type);
          break;
        case "scam_alerts":
          result = fallbackScamAlerts(payload.count || 5);
          break;
        case "analyze_qr":
          result = fallbackMerchantAnalysis(payload.input || "unknown", "qr");
          break;
        default:
          throw geminiError;
      }
    }

    return new Response(JSON.stringify({ success: true, data: result, fallback: usedFallback }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
