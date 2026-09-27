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
    supporting_memories: List[str]

class HindsightStatus(BaseModel):
    connected: bool
    mode: str  # "Live Mode" or "Demo Memory Mode"
    api_url: str
    bank_id: str
    memory_units_count: int
    last_operation: Optional[str] = None
    details: str
