import {
  Customer, CustomerCreate, Interaction, InteractionCreate,
  MemoryUnit, MemoryHealth, DealBriefing, ChatResponse,
  InsightsOverview, DemoStep, BeforeVsAfter, HindsightStatus,
  SearchResponse
} from '../types';

const API_BASE = '/api';

export async function fetchCustomers(): Promise<Customer[]> {
  const res = await fetch(`${API_BASE}/customers`);
  if (!res.ok) throw new Error('Failed to fetch customers');
  return res.json();
}

export async function fetchCustomer(id: string): Promise<Customer> {
  const res = await fetch(`${API_BASE}/customers/${id}`);
  if (!res.ok) throw new Error('Failed to fetch customer profile');
  return res.json();
}

export async function createCustomer(payload: CustomerCreate): Promise<Customer> {
  const res = await fetch(`${API_BASE}/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to create customer');
  return res.json();
}

export async function fetchInteractions(customerId: string): Promise<Interaction[]> {
  const res = await fetch(`${API_BASE}/customers/${customerId}/interactions`);
  if (!res.ok) throw new Error('Failed to fetch interactions');
  return res.json();
}

export async function addInteraction(customerId: string, payload: InteractionCreate): Promise<Interaction> {
  const res = await fetch(`${API_BASE}/customers/${customerId}/interactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to save interaction');
  return res.json();
}

export async function fetchTimeline(customerId: string): Promise<MemoryUnit[]> {
  const res = await fetch(`${API_BASE}/customers/${customerId}/timeline`);
  if (!res.ok) throw new Error('Failed to fetch memory timeline');
  return res.json();
}

export async function generateBriefing(customerId: string): Promise<DealBriefing> {
  const res = await fetch(`${API_BASE}/customers/${customerId}/briefing`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to generate deal briefing');
  return res.json();
}

export async function askDealMind(customerId: string, message: string, history: any[] = []): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/customers/${customerId}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history })
  });
  if (!res.ok) throw new Error('Failed to query DealMind AI');
  return res.json();
}

export async function fetchMemoryHealth(): Promise<MemoryHealth> {
  const res = await fetch(`${API_BASE}/memories/health`);
  if (!res.ok) throw new Error('Failed to fetch memory health');
  return res.json();
}

export async function fetchHindsightStatus(): Promise<HindsightStatus> {
  const res = await fetch(`${API_BASE}/memories/status`);
  if (!res.ok) throw new Error('Failed to fetch Hindsight status');
  return res.json();
}

export async function fetchInsights(): Promise<InsightsOverview> {
  const res = await fetch(`${API_BASE}/insights`);
  if (!res.ok) throw new Error('Failed to fetch sales insights');
  return res.json();
}

export async function fetchBeforeVsAfter(): Promise<BeforeVsAfter> {
  const res = await fetch(`${API_BASE}/demo/before-after`);
  if (!res.ok) throw new Error('Failed to fetch before vs after data');
  return res.json();
}

export async function runLearningDemo(): Promise<DemoStep[]> {
  const res = await fetch(`${API_BASE}/demo/run`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to run learning demo');
  return res.json();
}

export async function resetLearningDemo(): Promise<{ status: string; message: string }> {
  const res = await fetch(`${API_BASE}/demo/reset`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to reset demo');
  return res.json();
}

export async function searchGlobal(q: string): Promise<SearchResponse> {
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error('Failed to search');
  return res.json();
}
