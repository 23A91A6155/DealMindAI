from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# ==========================================
# Customer & Deal Models (App Metadata)
# ==========================================

class Contact(BaseModel):
    id: Optional[str] = None
    name: str
    role: str
    email: Optional[str] = None
    priority: Optional[str] = "Normal"  # e.g., "Decision Maker", "Technical Evaluator", "Procurement"

class Deal(BaseModel):
    id: Optional[str] = None
    customer_id: str
    title: str
    value: float
    stage: str  # Discovery, Technical Review, Proposal, Negotiation, Closed Won, Closed Lost
    probability: int  # 0 to 100%
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class CustomerSnapshot(BaseModel):
    industry: str
    company_size: str
    current_solution: str
    main_pain_points: List[str] = []
    decision_makers: List[str] = []
    budget_range: str
    buying_timeline: str

class Customer(BaseModel):
    id: str
    name: str
    domain: str
    overview: str
    deal_value: float
    deal_stage: str
    deal_probability: int
    contacts: List[Contact] = []
    snapshot: CustomerSnapshot
    known_preferences: List[str] = []
    known_objections: List[str] = []
    competitors_mentioned: List[str] = []
    created_at: Optional[str] = None

class CustomerCreate(BaseModel):
    name: str
    domain: str
    overview: str
    deal_value: float
    deal_stage: str
    deal_probability: int
    industry: str
    company_size: str
    current_solution: str
    budget_range: str
    buying_timeline: str

# ==========================================
# Interaction & Memory Models
# ==========================================

class InteractionCreate(BaseModel):
    customer_id: str
    contact_name: Optional[str] = None
    date: Optional[str] = None
    interaction_type: str  # Discovery Call, Technical Review, Demo, Pricing Discussion, Follow-up, Email
    notes: str
    outcome: Optional[str] = None
    objections: List[str] = []
    competitors: List[str] = []
    next_action: Optional[str] = None

class Interaction(InteractionCreate):
    id: str
    retained_memory: Optional[str] = None
    created_at: str

class MemoryUnit(BaseModel):
    id: str
    customer_id: str
    timestamp: str
    interaction_type: str
    memory: str
    source: str
    category: str  # Objection, Preference, Competitor, Pricing, Strategy, Milestone
    importance: str  # High, Medium, Low
    deal_title: Optional[str] = None

class MemoryHealth(BaseModel):
    memories_count: int
    interactions_count: int
    preferences_count: int
    objections_count: int
    successful_approaches_count: int
    competitors_tracked_count: int

# ==========================================
# AI Deal Briefing Models
# ==========================================

class DealBriefing(BaseModel):
    customer_id: str
    customer_name: str
    deal_value: float
    deal_stage: str
    generated_at: str
    what_happened: str
    what_matters_to_customer: List[str]
    main_risks_objections: List[str]
    competitors_context: List[str]
    what_worked_before: List[str]
    recommended_strategy: str
    suggested_talking_points: List[str]
    questions_to_ask: List[str]
    recommended_next_action: str
    memories_used: List[str]
    memory_count: int
    confidence_score: int  # 0 to 100%
    strategy_changed_because: Optional[str] = None
    historical_strategies_summary: Optional[List[Dict[str, Any]]] = []
    contradictions_detected: Optional[List[Dict[str, Any]]] = []
    questions_to_verify: Optional[List[str]] = []
    memory_citations_detailed: Optional[List[Dict[str, Any]]] = []

# ==========================================
# Chat & Memory Citation Models
# ==========================================

class ChatMessage(BaseModel):
    role: str  # user, assistant, system
    content: str
    memories_used: Optional[List[str]] = None
    timestamp: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    reply: str
    memories_used: List[str]
    sources_count: int
    why_recommended: Optional[str] = None

# ==========================================
# Insights & Visualizer Models
# ==========================================

class InsightCategory(BaseModel):
    title: str
    count: int
    details: List[str]

class InsightsOverview(BaseModel):
    repeated_objections: List[InsightCategory]
    successful_messaging: List[InsightCategory]
    deal_risks: List[InsightCategory]
    customer_preferences: List[InsightCategory]
    recommended_actions: List[str]
    loop_stages: List[Dict[str, Any]]

# ==========================================
# Demo & Status Models
# ==========================================

class DemoStep(BaseModel):
    step_number: int
    step_title: str
    customer_name: str
    input_text: str
    action_type: str  # retain or reflect
    agent_output: str
    memory_retained: Optional[str] = None
    accumulated_memory_count: int

class BeforeVsAfter(BaseModel):
    scenario: str
    generic_ai: str
    dealmind_hindsight: str
    outcome_aware_dealmind: Optional[str] = None
    supporting_memories: List[str]
    strategy_reasons: Optional[List[str]] = None


class HindsightStatus(BaseModel):
    connected: bool
    mode: str  # "Live Mode" or "Demo Memory Mode"
    api_url: str
    bank_id: str
    memory_units_count: int
    last_operation: Optional[str] = None
    details: str

# ==========================================
# Feature 1: Strategy DNA Models
# ==========================================

class StrategyAttempt(BaseModel):
    id: str
    customer_id: str
    interaction_id: Optional[str] = None
    stakeholder_id: Optional[str] = None
    stakeholder_name: Optional[str] = None
    strategy_type: str  # ROI presentation, Product demonstration, Technical case study, Discount negotiation, Competitor comparison, Security reassurance, Implementation planning, Pilot proposal, Executive alignment, Custom strategy
    strategy_description: str
    objection_addressed: Optional[str] = None
    supporting_materials: Optional[str] = None
    date_attempted: str
    salesperson_notes: Optional[str] = None
    customer_response: Optional[str] = None
    observed_outcome: str  # SUCCESSFUL, UNSUCCESSFUL, PARTIALLY_SUCCESSFUL, INCONCLUSIVE, NOT_ATTEMPTED
    outcome_confidence: float = 0.85
    evidence_references: List[str] = []
    follow_up_actions: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class StrategyCreate(BaseModel):
    customer_id: str
    interaction_id: Optional[str] = None
    stakeholder_id: Optional[str] = None
    stakeholder_name: Optional[str] = None
    strategy_type: str
    strategy_description: str
    objection_addressed: Optional[str] = None
    supporting_materials: Optional[str] = None
    date_attempted: Optional[str] = None
    salesperson_notes: Optional[str] = None
    customer_response: Optional[str] = None
    observed_outcome: str = "NOT_ATTEMPTED"
    outcome_confidence: float = 0.85
    evidence_references: List[str] = []
    follow_up_actions: Optional[str] = None

class StrategyUpdateOutcome(BaseModel):
    customer_response: Optional[str] = None
    observed_outcome: str
    outcome_confidence: Optional[float] = 0.85
    salesperson_notes: Optional[str] = None
    follow_up_actions: Optional[str] = None

# ==========================================
# Feature 2: Stakeholder Memory Graph Models
# ==========================================

class StakeholderNode(BaseModel):
    id: str
    customer_id: str
    name: str
    role: str
    email: Optional[str] = None
    influence_level: str = "Medium"  # High, Medium, Low
    decision_power: str = "Influencer"  # Decision Maker, Champion, Blocker, Technical Evaluator, Procurement, End User
    priorities: List[str] = []
    objections: List[str] = []
    preferences: List[str] = []
    relationships: List[Dict[str, str]] = []  # e.g. [{"target": "Marcus Vance", "type": "reports_to"}]
    last_interaction_date: Optional[str] = None
    strategies_presented: List[Dict[str, Any]] = []

class StakeholderGraphData(BaseModel):
    account_node: Dict[str, Any]
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]

# ==========================================
# Feature 3: Customer Contradiction Checker Models
# ==========================================

class ContradictionRecord(BaseModel):
    id: str
    customer_id: str
    topic: str
    earlier_statement: str
    earlier_meeting_date: Optional[str] = None
    earlier_interaction_id: Optional[str] = None
    latest_statement: str
    latest_meeting_date: Optional[str] = None
    latest_interaction_id: Optional[str] = None
    supporting_evidence: Optional[str] = None
    confidence: float = 0.9
    status: str  # UNREVIEWED, CONFIRMED_CHANGE, NOT_A_CONTRADICTION, NEEDS_CLARIFICATION, RESOLVED
    recommended_action: Optional[str] = None
    resolution_notes: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class ContradictionUpdateStatus(BaseModel):
    status: str  # CONFIRMED_CHANGE, NOT_A_CONTRADICTION, NEEDS_CLARIFICATION, RESOLVED
    resolution_notes: Optional[str] = None

# ==========================================
# Feature 4: Strategy Experiment Models
# ==========================================

class StrategyExperiment(BaseModel):
    id: str
    customer_id: str
    briefing_id: Optional[str] = None
    recommended_strategy: str
    recommendation_date: str
    attempted: bool = False
    attempt_date: Optional[str] = None
    stakeholder_name: Optional[str] = None
    customer_response: Optional[str] = None
    observed_outcome: str = "NOT_ATTEMPTED"
    salesperson_notes: Optional[str] = None
    next_action: Optional[str] = None
    created_at: Optional[str] = None

class StrategyExperimentUpdate(BaseModel):
    attempted: bool
    attempt_date: Optional[str] = None
    stakeholder_name: Optional[str] = None
    customer_response: Optional[str] = None
    observed_outcome: str
    salesperson_notes: Optional[str] = None
    next_action: Optional[str] = None

# ==========================================
# Feature 6: Account Memory Health Model
# ==========================================

class AccountMemoryHealth(BaseModel):
    customer_id: str
    customer_name: str
    meetings_count: int
    memories_count: int
    stakeholders_count: int
    unresolved_objections_count: int
    strategy_outcomes_count: int
    successful_strategies_count: int
    unsuccessful_strategies_count: int
    contradictions_count: int
    unreviewed_contradictions_count: int
    last_memory_update: Optional[str] = None
    memory_status: str  # FRESH, NEEDS_REVIEW, OUTDATED, INSUFFICIENT_DATA
    status_reason: str
    warning: Optional[str] = None

# ==========================================
# Evaluation Framework Benchmark Models
# ==========================================

class BenchmarkModeResult(BaseModel):
    mode_name: str
    description: str
    relevance_score: float  # 0 to 100
    objection_recall_rate: float  # 0 to 100%
    strategy_awareness: float  # 0 to 100%
    evidence_citation_coverage: float  # 0 to 100%
    contradiction_precision: float  # 0 to 100%
    hallucination_rate: float  # 0 to 100% (lower is better)
    avg_latency_ms: float
    sample_recommendation: str

class EvaluationBenchmarkResult(BaseModel):
    dataset_version: str
    total_eval_scenarios: int
    run_timestamp: str
    mode_a_stateless: BenchmarkModeResult
    mode_b_hindsight: BenchmarkModeResult
    mode_c_outcome_aware: BenchmarkModeResult
