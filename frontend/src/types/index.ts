export interface Contact {
  id?: string;
  name: string;
  role: string;
  email?: string;
  priority?: string;
}

export interface Deal {
  id?: string;
  customer_id: string;
  title: string;
  value: number;
  stage: string;
  probability: number;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerSnapshot {
  industry: string;
  company_size: string;
  current_solution: string;
  main_pain_points: string[];
  decision_makers: string[];
  budget_range: string;
  buying_timeline: string;
}

export interface Customer {
  id: string;
  name: string;
  domain: string;
  overview: string;
  deal_value: number;
  deal_stage: string;
  deal_probability: number;
  contacts: Contact[];
  snapshot: CustomerSnapshot;
  known_preferences: string[];
  known_objections: string[];
  competitors_mentioned: string[];
  created_at?: string;
}

export interface CustomerCreate {
  name: string;
  domain: string;
  overview: string;
  deal_value: number;
  deal_stage: string;
  deal_probability: number;
  industry: string;
  company_size: string;
  current_solution: string;
  budget_range: string;
  buying_timeline: string;
}

export interface Interaction {
  id: string;
  customer_id: string;
  contact_name?: string;
  date?: string;
  interaction_type: string;
  notes: string;
  outcome?: string;
  objections: string[];
  competitors: string[];
  next_action?: string;
  retained_memory?: string;
  created_at: string;
}

export interface InteractionCreate {
  customer_id: string;
  contact_name?: string;
  date?: string;
  interaction_type: string;
  notes: string;
  outcome?: string;
  objections: string[];
  competitors: string[];
  next_action?: string;
}

export interface MemoryUnit {
  id: string;
  customer_id: string;
  timestamp: string;
  interaction_type: string;
  memory: string;
  source: string;
  category: string;
  importance: string;
  deal_title?: string;
}

export interface MemoryHealth {
  memories_count: number;
  interactions_count: number;
  preferences_count: number;
  objections_count: number;
  successful_approaches_count: number;
  competitors_tracked_count: number;
}

export interface DealBriefing {
  customer_id: string;
  customer_name: string;
  deal_value: number;
  deal_stage: string;
  generated_at: string;
  what_happened: string;
  what_matters_to_customer: string[];
  main_risks_objections: string[];
  competitors_context: string[];
  what_worked_before: string[];
  recommended_strategy: string;
  suggested_talking_points: string[];
  questions_to_ask: string[];
  recommended_next_action: string;
  memories_used: string[];
  memory_count: number;
  confidence_score: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  memories_used?: string[];
  why_recommended?: string;
  timestamp?: string;
}

export interface ChatResponse {
  reply: string;
  memories_used: string[];
  sources_count: number;
  why_recommended?: string;
}

export interface InsightCategory {
  title: string;
  count: number;
  details: string[];
}

export interface InsightsOverview {
  repeated_objections: InsightCategory[];
  successful_messaging: InsightCategory[];
  deal_risks: InsightCategory[];
  customer_preferences: InsightCategory[];
  recommended_actions: string[];
  loop_stages: {
    step: number;
    title: string;
    desc: string;
  }[];
}

export interface DemoStep {
  step_number: number;
  step_title: string;
  customer_name: string;
  input_text: string;
  action_type: 'retain' | 'reflect';
  agent_output: string;
  memory_retained?: string;
  accumulated_memory_count: number;
}

export interface BeforeVsAfter {
  scenario: string;
  generic_ai: string;
  dealmind_hindsight: string;
  supporting_memories: string[];
}

export interface HindsightStatus {
  connected: boolean;
  mode: string;
  api_url: string;
  bank_id: string;
  memory_units_count: number;
  last_operation?: string;
  details: string;
}

export interface SearchResult {
  id: string;
  type: 'customer' | 'deal' | 'interaction' | 'memory';
  title: string;
  subtitle: string;
  link: string;
}

export interface SearchResponse {
  query: string;
  customers: SearchResult[];
  deals: SearchResult[];
  interactions: SearchResult[];
  memories: SearchResult[];
  total_results: number;
}
