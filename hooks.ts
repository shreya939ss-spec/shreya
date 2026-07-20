import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export interface CrimeFeedItem {
  id: string;
  alert_type: string;
  pillar: string;
  title: string;
  description: string;
  city: string;
  state: string;
  district: string;
  severity: string;
  amount_lost_cr: number | null;
  victims_count: number | null;
  reported_at: string;
}

export interface FlaggedNumber {
  id: string;
  phone_number: string;
  scam_type: string;
  scam_category: string;
  operator_name: string | null;
  origin_state: string | null;
  reports_count: number;
  risk_level: string;
  suspect_name: string | null;
  suspect_alias: string | null;
  suspect_face_url: string | null;
  suspect_age: number | null;
  suspect_description: string | null;
  known_scripts: string[] | null;
  last_reported_city: string | null;
  last_reported_state: string | null;
}

export interface FlaggedMerchant {
  id: string;
  upi_id: string | null;
  shop_name: string | null;
  registered_city: string | null;
  registered_state: string | null;
  reports_count: number;
  trust_score: number;
  status: string;
  risk_level: string;
  fraud_type: string | null;
}

export interface DistrictHeatmap {
  id: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  alert_count: number;
  counterfeit_count: number;
  merchant_flags: number;
  scam_call_count: number;
  total_loss_cr: number;
  priority_level: string;
}

export interface ScanResult {
  id: string;
  session_id: string;
  pillar: string;
  input_type: string | null;
  input_value: string | null;
  verdict: string;
  confidence_score: number | null;
  risk_level: string | null;
  details: any;
  image_url: string | null;
  created_at: string;
}

export interface FraudNode {
  id: string;
  node_type: string;
  identifier: string;
  label: string;
  city: string | null;
  state: string | null;
  risk_score: number;
  connections_count: number;
  pillar_source: string;
}

export interface FraudEdge {
  id: string;
  source_node_id: string;
  target_node_id: string;
  connection_type: string;
  strength: number;
}

export function useCrimeFeed() {
  const [items, setItems] = useState<CrimeFeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('crime_feed')
      .select('*')
      .order('reported_at', { ascending: false })
      .then(({ data }) => {
        setItems(data || []);
        setLoading(false);
      });
  }, []);

  return { items, loading };
}

export function useFlaggedNumbers() {
  const [items, setItems] = useState<FlaggedNumber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('flagged_numbers')
      .select('*')
      .order('reports_count', { ascending: false })
      .then(({ data }) => {
        setItems(data || []);
        setLoading(false);
      });
  }, []);

  return { items, loading };
}

export function useFlaggedMerchants() {
  const [items, setItems] = useState<FlaggedMerchant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('flagged_merchants')
      .select('*')
      .order('reports_count', { ascending: false })
      .then(({ data }) => {
        setItems(data || []);
        setLoading(false);
      });
  }, []);

  return { items, loading };
}

export function useDistrictsHeatmap() {
  const [items, setItems] = useState<DistrictHeatmap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('districts_heatmap')
      .select('*')
      .order('alert_count', { ascending: false })
      .then(({ data }) => {
        setItems(data || []);
        setLoading(false);
      });
  }, []);

  return { items, loading };
}

export function useScanHistory(sessionId: string | undefined) {
  const [items, setItems] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) { setLoading(false); return; }
    supabase
      .from('scan_results')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setItems(data || []);
        setLoading(false);
      });
  }, [sessionId]);

  return { items, loading, refresh: () => setLoading(true) };
}

export function useFraudGraph() {
  const [nodes, setNodes] = useState<FraudNode[]>([]);
  const [edges, setEdges] = useState<FraudEdge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('fraud_nodes').select('*'),
      supabase.from('fraud_edges').select('*'),
    ]).then(([n, e]) => {
      setNodes(n.data || []);
      setEdges(e.data || []);
      setLoading(false);
    });
  }, []);

  return { nodes, edges, loading };
}

export async function saveScanResult(data: {
  session_id: string;
  pillar: string;
  input_type?: string;
  input_value?: string;
  verdict: string;
  confidence_score?: number;
  risk_level?: string;
  details?: any;
  image_url?: string;
}) {
  return supabase.from('scan_results').insert(data);
}

export async function saveEmergencyAlert(data: {
  session_id: string;
  contact_name?: string;
  contact_phone?: string;
  trigger_type?: string;
  status?: string;
  location_city?: string;
}) {
  return supabase.from('emergency_alerts').insert(data);
}
