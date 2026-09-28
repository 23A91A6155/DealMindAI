import {
  Customer, CustomerCreate, Interaction, InteractionCreate,
  MemoryUnit, MemoryHealth, DealBriefing, ChatResponse,
  InsightsOverview, DemoStep, BeforeVsAfter, HindsightStatus,
  SearchResponse, StrategyAttempt, StrategyCreate, StrategyUpdateOutcome,
  StakeholderNode, StakeholderGraphData, ContradictionRecord,
  StrategyExperiment, StrategyExperimentUpdate, AccountMemoryHealth,
  EvaluationBenchmarkResult
} from '../types';


const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();
const API_BASE = rawApiUrl ? `${rawApiUrl.replace(/\/$/, '')}/api` : '/api';

/**
 * Enterprise resilient fetcher with automatic exponential backoff retry.
 * Handles Render free-tier cold starts (502, 503, 520, network blips) gracefully.
 */
async function safeFetch(url: string, options?: RequestInit, maxRetries = 5, baseDelayMs = 1200): Promise<Response> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const res = await fetch(url, options);
      // If server is cold-starting or proxy is restarting, retry
      if (res.status >= 500 && res.status <= 599) {
        attempt++;
        if (attempt >= maxRetries) return res;
        await new Promise((r) => setTimeout(r, baseDelayMs * attempt));
        continue;
      }
      return res;
    } catch (err) {
      attempt++;
      if (attempt >= maxRetries) throw err;
      await new Promise((r) => setTimeout(r, baseDelayMs * attempt));
    }
  }
  return fetch(url, options);
}

export async function checkBackendHealth(): Promise<{ status: string; hindsight?: any }> {
  const res = await safeFetch(`${API_BASE}/health`, undefined, 10, 2000);
  if (!res.ok) throw new Error('Backend health check failed');
  return res.json();
}

export async function fetchCustomers(): Promise<Customer[]> {
  const res = await safeFetch(`${API_BASE}/customers`);
  if (!res.ok) throw new Error('Failed to fetch customers');
  return res.json();
}

export async function fetchCustomer(id: string): Promise<Customer> {
  const res = await safeFetch(`${API_BASE}/customers/${id}`);
  if (!res.ok) throw new Error('Failed to fetch customer profile');
  return res.json();
}

export async function createCustomer(payload: CustomerCreate): Promise<Customer> {
  const res = await safeFetch(`${API_BASE}/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to create customer');
  return res.json();
}

export async function fetchInteractions(customerId: string): Promise<Interaction[]> {
  const res = await safeFetch(`${API_BASE}/customers/${customerId}/interactions`);
  if (!res.ok) throw new Error('Failed to fetch interactions');
  return res.json();
}

export async function addInteraction(customerId: string, payload: InteractionCreate): Promise<Interaction> {
  const res = await safeFetch(`${API_BASE}/customers/${customerId}/interactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to save interaction');
  return res.json();
}

export async function fetchTimeline(customerId: string): Promise<MemoryUnit[]> {
  const res = await safeFetch(`${API_BASE}/customers/${customerId}/timeline`);
  if (!res.ok) throw new Error('Failed to fetch memory timeline');
  return res.json();
}

export async function generateBriefing(customerId: string): Promise<DealBriefing> {
  const res = await safeFetch(`${API_BASE}/customers/${customerId}/briefing`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to generate deal briefing');
  return res.json();
}

export async function askDealMind(customerId: string, message: string, history: any[] = []): Promise<ChatResponse> {
  const res = await safeFetch(`${API_BASE}/customers/${customerId}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history })
  }, 3, 1000);
  if (!res.ok) throw new Error('Failed to query DealMind AI');
  return res.json();
}

export async function fetchMemoryHealth(): Promise<MemoryHealth> {
  const res = await safeFetch(`${API_BASE}/memories/health`);
  if (!res.ok) throw new Error('Failed to fetch memory health');
  return res.json();
}

export async function fetchHindsightStatus(): Promise<HindsightStatus> {
  const res = await safeFetch(`${API_BASE}/memories/status`);
  if (!res.ok) throw new Error('Failed to fetch Hindsight status');
  return res.json();
}

export async function fetchInsights(): Promise<InsightsOverview> {
  const res = await safeFetch(`${API_BASE}/insights`);
  if (!res.ok) throw new Error('Failed to fetch sales insights');
  return res.json();
}

export async function fetchBeforeVsAfter(): Promise<BeforeVsAfter> {
  const res = await safeFetch(`${API_BASE}/demo/before-after`);
  if (!res.ok) throw new Error('Failed to fetch before vs after data');
  return res.json();
}

export async function runLearningDemo(): Promise<DemoStep[]> {
  const res = await safeFetch(`${API_BASE}/demo/run`, {
    method: 'POST'
  }, 2, 2000);
  if (!res.ok) throw new Error('Failed to run learning demo');
  return res.json();
}

export async function resetLearningDemo(): Promise<{ status: string; message: string }> {
  const res = await safeFetch(`${API_BASE}/demo/reset`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to reset demo');
  return res.json();
}

export async function searchGlobal(q: string): Promise<SearchResponse> {
  const res = await safeFetch(`${API_BASE}/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error('Failed to search');
  return res.json();
}

// ==========================================
// Strategy DNA APIs
// ==========================================

export async function fetchCustomerStrategies(customerId: string): Promise<StrategyAttempt[]> {
  const res = await safeFetch(`${API_BASE}/strategies/customer/${customerId}`);
  if (!res.ok) throw new Error('Failed to fetch strategies');
  return res.json();
}

export async function createStrategyAttempt(payload: StrategyCreate): Promise<StrategyAttempt> {
  const res = await safeFetch(`${API_BASE}/strategies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to create strategy attempt');
  return res.json();
}

export async function updateStrategyOutcome(strategyId: string, payload: StrategyUpdateOutcome): Promise<StrategyAttempt> {
  const res = await safeFetch(`${API_BASE}/strategies/${strategyId}/outcome`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to record strategy outcome');
  return res.json();
}

export async function fetchStrategiesSummary(customerId: string): Promise<{
  customer_id: string;
  total_strategies: number;
  successful: number;
  unsuccessful: number;
  partially_successful: number;
  not_attempted: number;
}> {
  const res = await safeFetch(`${API_BASE}/strategies/customer/${customerId}/summary`);
  if (!res.ok) throw new Error('Failed to fetch strategies summary');
  return res.json();
}

// ==========================================
// Stakeholder Graph APIs
// ==========================================

export async function fetchCustomerStakeholders(customerId: string): Promise<StakeholderNode[]> {
  const res = await safeFetch(`${API_BASE}/stakeholders/customer/${customerId}`);
  if (!res.ok) throw new Error('Failed to fetch stakeholders');
  return res.json();
}

export async function fetchStakeholderGraph(customerId: string): Promise<StakeholderGraphData> {
  const res = await safeFetch(`${API_BASE}/stakeholders/customer/${customerId}/graph`);
  if (!res.ok) throw new Error('Failed to fetch stakeholder graph');
  return res.json();
}

// ==========================================
// Contradiction Checker APIs
// ==========================================

export async function fetchCustomerContradictions(customerId: string): Promise<ContradictionRecord[]> {
  const res = await safeFetch(`${API_BASE}/contradictions/customer/${customerId}`);
  if (!res.ok) throw new Error('Failed to fetch contradictions');
  return res.json();
}

export async function updateContradictionStatus(
  contradictionId: string,
  status: string,
  resolutionNotes?: string
): Promise<ContradictionRecord> {
  const res = await safeFetch(`${API_BASE}/contradictions/${contradictionId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, resolution_notes: resolutionNotes })
  });
  if (!res.ok) throw new Error('Failed to update contradiction status');
  return res.json();
}

export async function detectCustomerContradictions(customerId: string): Promise<ContradictionRecord[]> {
  const res = await safeFetch(`${API_BASE}/contradictions/detect/${customerId}`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to run contradiction scan');
  return res.json();
}

// ==========================================
// Strategy Experiment APIs
// ==========================================

export async function fetchAccountExperiments(customerId: string): Promise<StrategyExperiment[]> {
  const res = await safeFetch(`${API_BASE}/strategies/experiments/customer/${customerId}`);
  if (!res.ok) throw new Error('Failed to fetch experiments');
  return res.json();
}

export async function updateStrategyExperiment(
  experimentId: string,
  payload: StrategyExperimentUpdate
): Promise<StrategyExperiment> {
  const res = await safeFetch(`${API_BASE}/strategies/experiments/${experimentId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to update strategy experiment');
  return res.json();
}

// ==========================================
// Account Health API
// ==========================================

export async function fetchAccountHealth(customerId: string): Promise<AccountMemoryHealth> {
  const res = await safeFetch(`${API_BASE}/customers/${customerId}/health`);
  if (!res.ok) throw new Error('Failed to fetch account health');
  return res.json();
}

// ==========================================
// Evaluation Benchmark APIs
// ==========================================

export async function fetchEvaluationBenchmark(): Promise<EvaluationBenchmarkResult> {
  const res = await safeFetch(`${API_BASE}/evaluation/benchmark`);
  if (!res.ok) throw new Error('Failed to fetch evaluation benchmark');
  return res.json();
}

export async function runLiveBenchmark(customerId: string): Promise<{
  status: string;
  target_customer: string;
  benchmark: EvaluationBenchmarkResult;
  delta: {
    relevance_gain: string;
    mistake_avoidance: string;
    evidence_grounding: string;
  };
}> {
  const res = await safeFetch(`${API_BASE}/evaluation/run?customer_id=${encodeURIComponent(customerId)}`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to run live benchmark');
  return res.json();
}

