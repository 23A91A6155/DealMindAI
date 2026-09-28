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
  strategy_changed_because?: string;
  historical_strategies_summary?: string;
  contradictions_detected?: ContradictionRecord[];
  suggested_talking_points: string[];
  questions_to_ask: string[];
  questions_to_verify?: string[];
  recommended_next_action: string;
  memories_used: string[];
  memory_citations_detailed?: { id: string; memory: string; date?: string; category?: string }[];
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
  outcome_aware_dealmind?: string;
  supporting_memories: string[];
  strategy_reasons?: string[];
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

// ==========================================
// Strategy DNA Interfaces
// ==========================================

export interface StrategyAttempt {
  id: string;
  customer_id: string;
  interaction_id?: string;
  stakeholder_id?: string;
  stakeholder_name?: string;
  strategy_type: string;
  strategy_description: string;
  objection_addressed?: string;
  supporting_materials?: string;
  date_attempted: string;
  salesperson_notes?: string;
  customer_response?: string;
  observed_outcome: 'SUCCESSFUL' | 'UNSUCCESSFUL' | 'PARTIALLY_SUCCESSFUL' | 'INCONCLUSIVE' | 'NOT_ATTEMPTED';
  outcome_confidence: number;
  evidence_references: string[];
  follow_up_actions?: string;
  created_at?: string;
  updated_at?: string;
}

export interface StrategyCreate {
  customer_id: string;
  interaction_id?: string;
  stakeholder_id?: string;
  stakeholder_name?: string;
  strategy_type: string;
  strategy_description: string;
  objection_addressed?: string;
  supporting_materials?: string;
  date_attempted?: string;
  salesperson_notes?: string;
  customer_response?: string;
  observed_outcome?: string;
  outcome_confidence?: number;
  evidence_references?: string[];
  follow_up_actions?: string;
}

export interface StrategyUpdateOutcome {
  customer_response?: string;
  observed_outcome: string;
  outcome_confidence?: number;
  salesperson_notes?: string;
  follow_up_actions?: string;
}

// ==========================================
// Stakeholder Graph Interfaces
// ==========================================

export interface StakeholderNode {
  id: string;
  customer_id: string;
  name: string;
  role: string;
  email?: string;
  influence_level: 'High' | 'Medium' | 'Low';
  decision_power: 'Decision Maker' | 'Champion' | 'Blocker' | 'Technical Evaluator' | 'Procurement' | 'End User';
  priorities: string[];
  objections: string[];
  preferences: string[];
  relationships: { target: string; type: string }[];
  last_interaction_date?: string;
  strategies_presented?: any[];
}

export interface StakeholderGraphData {
  account_node: {
    id: string;
    label: string;
    type: string;
    deal_value: number;
    stage: string;
  };
  nodes: {
    id: string;
    label: string;
    role: string;
    influence: string;
    decision_power: string;
    priorities_count: number;
    objections_count: number;
  }[];
  edges: {
    source: string;
    target: string;
    label: string;
    type: string;
  }[];
}

// ==========================================
// Contradiction Checker Interfaces
// ==========================================

export interface ContradictionRecord {
  id: string;
  customer_id: string;
  topic: string;
  earlier_statement: string;
  earlier_meeting_date?: string;
  earlier_interaction_id?: string;
  latest_statement: string;
  latest_meeting_date?: string;
  latest_interaction_id?: string;
  supporting_evidence?: string;
  confidence: number;
  status: 'UNREVIEWED' | 'CONFIRMED_CHANGE' | 'NOT_A_CONTRADICTION' | 'NEEDS_CLARIFICATION' | 'RESOLVED';
  recommended_action?: string;
  resolution_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ContradictionUpdateStatus {
  status: string;
  resolution_notes?: string;
}

// ==========================================
// Strategy Experiment Interfaces
// ==========================================

export interface StrategyExperiment {
  id: string;
  customer_id: string;
  briefing_id?: string;
  recommended_strategy: string;
  recommendation_date: string;
  attempted: boolean;
  attempt_date?: string;
  stakeholder_name?: string;
  customer_response?: string;
  observed_outcome: string;
  salesperson_notes?: string;
  next_action?: string;
  created_at?: string;
}

export interface StrategyExperimentUpdate {
  attempted: boolean;
  attempt_date?: string;
  stakeholder_name?: string;
  customer_response?: string;
  observed_outcome: string;
  salesperson_notes?: string;
  next_action?: string;
}

// ==========================================
// Account Memory Health Interface
// ==========================================

export interface AccountMemoryHealth {
  customer_id: string;
  customer_name: string;
  meetings_count: number;
  memories_count: number;
  stakeholders_count: number;
  unresolved_objections_count: number;
  strategy_outcomes_count: number;
  successful_strategies_count: number;
  unsuccessful_strategies_count: number;
  contradictions_count: number;
  unreviewed_contradictions_count: number;
  last_memory_update?: string;
  memory_status: 'FRESH' | 'NEEDS_REVIEW' | 'OUTDATED' | 'INSUFFICIENT_DATA';
  status_reason: string;
  warning?: string;
}

// ==========================================
// Evaluation Benchmark Interfaces
// ==========================================

export interface BenchmarkModeResult {
  mode_name: string;
  description: string;
  relevance_score: number;
  objection_recall_rate: number;
  strategy_awareness: number;
  evidence_citation_coverage: number;
  contradiction_precision: number;
  hallucination_rate: number;
  avg_latency_ms: number;
  sample_recommendation: string;
}

export interface EvaluationBenchmarkResult {
  dataset_version: string;
  total_eval_scenarios: number;
  run_timestamp: string;
  mode_a_stateless: BenchmarkModeResult;
  mode_b_hindsight: BenchmarkModeResult;
  mode_c_outcome_aware: BenchmarkModeResult;
}

