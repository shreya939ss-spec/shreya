const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/narad-ai`;

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
};

export interface CurrencyResult {
  verdict: string;
  confidence: number;
  riskLevel: string;
  denomination?: string;
  securityFeatures?: Array<{ name: string; passed: boolean; confidence: number }>;
  notes?: string;
  recommendation?: string;
  rawResponse?: string;
}

export interface MessageResult {
  verdict: string;
  riskScore: number;
  riskLevel: string;
  flaggedPhrases?: Array<{ phrase: string; reason: string; risk: number }>;
  scamType?: string;
  explanation?: string;
  recommendation?: string;
  rawResponse?: string;
}

export interface PhoneResult {
  verdict: string;
  riskScore: number;
  riskLevel: string;
  possibleScamType?: string;
  reasoning?: string;
  recommendation?: string;
  suspectProfile?: {
    likelyOperator?: string;
    likelyRegion?: string;
    knownPatterns?: string[];
  };
  rawResponse?: string;
}

export interface MerchantResult {
  verdict: string;
  trustScore: number;
  riskLevel: string;
  merchantName?: string;
  possibleIssues?: string[];
  recommendation?: string;
  rawResponse?: string;
}

export interface QrResult {
  decodedContent?: string;
  verdict: string;
  trustScore: number;
  riskLevel: string;
  containsUrl?: boolean;
  containsUpiId?: boolean;
  upiId?: string | null;
  recommendation?: string;
  rawResponse?: string;
}

export interface ScamAlert {
  title: string;
  description: string;
  city: string;
  state: string;
  scamType: string;
  severity: string;
  advisory: string;
}

async function callAI(action: string, payload: any): Promise<any> {
  const res = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ action, payload }),
  });

  if (!res.ok) {
    throw new Error(`AI request failed (${res.status})`);
  }

  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'AI analysis failed');
  return json.data;
}

export function isFallback(response: any): boolean {
  return response?.fallback === true;
}

export async function analyzeCurrencyImage(imageBase64: string, mime: string): Promise<CurrencyResult> {
  return callAI('analyze_currency', { image: imageBase64, imageMime: mime });
}

export async function analyzeMessage(message: string): Promise<MessageResult> {
  return callAI('analyze_message', { message });
}

export async function analyzePhone(phone: string, context?: string): Promise<PhoneResult> {
  return callAI('analyze_phone', { phone, context });
}

export async function analyzeMerchant(input: string, type: string): Promise<MerchantResult> {
  return callAI('analyze_merchant', { input, type });
}

export async function analyzeQrImage(imageBase64: string, mime: string): Promise<QrResult> {
  return callAI('analyze_qr', { image: imageBase64, imageMime: mime });
}

export async function getScamAlerts(count: number = 5, region?: string): Promise<{ alerts: ScamAlert[] }> {
  return callAI('scam_alerts', { count, region });
}

export function fileToBase64(file: File): Promise<{ data: string; mime: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve({ data: base64, mime: file.type || 'image/jpeg' });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function dataUrlToBase64(dataUrl: string): { data: string; mime: string } {
  const parts = dataUrl.split(',');
  const mimeMatch = parts[0].match(/data:(.*?);base64/);
  return { data: parts[1], mime: mimeMatch ? mimeMatch[1] : 'image/jpeg' };
}
