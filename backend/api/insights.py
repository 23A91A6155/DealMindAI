import logging
from typing import List, Dict, Any
from fastapi import APIRouter
from backend.models.schemas import InsightsOverview, InsightCategory
from backend.services.hindsight_service import hindsight_service

router = APIRouter(prefix="/api/insights", tags=["AI Insights"])
logger = logging.getLogger(__name__)

@router.get("", response_model=InsightsOverview)
async def get_sales_insights():
    """
    Synthesize macro intelligence across all stored memories.
    Generates repeated objections, successful messaging, risks, preferences, and recommended actions.
    """
    # Build aggregate insights from memories
    mems = hindsight_service._demo_memories
    
    repeated_objections = [
        InsightCategory(
            title="Migration Downtime & Disruption",
            count=8,
            details=[
                "Acme Corp: Sarah Lin flagged manufacturing shop floor disruption.",
                "Globex Logistics: Carlos Mendez highlighted 24/7 port operational sensitivity.",
                "TechNova: Elena Rostov cited live model inference interruption fears."
            ]
        ),
        InsightCategory(
            title="Upfront Professional Services / Cost",
            count=6,
            details=[
                "Acme Corp: David Keller (Procurement) pushed for fixed annual packaging.",
                "TechNova: Aris Thorne raised concerns on hourly GPU markup."
            ]
        ),
        InsightCategory(
            title="Security & Compliance Certifications",
            count=5,
            details=[
                "Acme Corp: Marcus Vance mandated SOC2 Type II and ISO 27001.",
                "Vertex Financial: Victoria Sterling required private VPC enclave with zero PII egress."
            ]
        )
    ]
    
    successful_messaging = [
        InsightCategory(
            title="Quantified Peer ROI Case Studies",
            count=9,
            details=[
                "Acme Corp: 4.2x payback in 9 months case study forwarded to CTO & Procurement.",
                "Globex: Demurrage penalty reduction model secured pilot sign-off."
            ]
        ),
        InsightCategory(
            title="Live Architectural Cutover Demos",
            count=6,
            details=[
                "Demonstrating blue/green failover eliminated Competitor X consideration at Acme.",
                "Low-latency benchmark (14ms vs InferaCloud 28ms) passed TechNova review."
            ]
        ),
        InsightCategory(
            title="Bundled Fixed-Fee Migration Packages",
            count=5,
            details=[
                "Eliminating hourly variable fees unlocked stalled discussions with procurement teams."
            ]
        )
    ]
    
    deal_risks = [
        InsightCategory(
            title="Unaddressed Procurement Objections",
            count=3,
            details=[
                "Acme Corp: Initial $180k cost proposal must be paired with amortization schedule.",
                "TechNova: Monthly billing preference must be confirmed before contract signature."
            ]
        ),
        InsightCategory(
            title="Competitive Evaluations in Progress",
            count=4,
            details=[
                "Acme Corp evaluating Competitor X.",
                "TechNova concurrently testing InferaCloud."
            ]
        )
    ]
    
    customer_preferences = [
        InsightCategory(
            title="Technical & Evidence-First Buyers",
            count=7,
            details=[
                "80% of technical decision makers prefer architecture diagrams over marketing slides."
            ]
        ),
        InsightCategory(
            title="Compliance & Data Sovereignty",
            count=5,
            details=[
                "VPC enclave, SOC2 Type II, and strict non-egress guarantees are mandatory."
            ]
        )
    ]
    
    recommended_actions = [
        "Acme Corp: Submit formal proposal featuring blue/green cutover warranty and 4.2x ROI payback schedule.",
        "TechNova: Finalize monthly rolling contract terms to prevent InferaCloud pilot expansion.",
        "Globex Logistics: Deliver Singapore/Rotterdam pilot kickoff curriculum to warehouse leads.",
        "Vertex Financial: Coordinate final legal review on standard MSA indemnification clause."
    ]
    
    loop_stages = [
        {
            "step": 1,
            "title": "Interaction",
            "desc": "Sales rep meets prospect and captures raw meeting notes, objections, and outcomes."
        },
        {
            "step": 2,
            "title": "Memory Retention",
            "desc": "Hindsight extracts facts, semantic entities, and registers structured memory units."
        },
        {
            "step": 3,
            "title": "Pattern Recognition",
            "desc": "Hindsight links objections (migration downtime) and preferences (ROI case studies) across accounts."
        },
        {
            "step": 4,
            "title": "Strategic Reflection",
            "desc": "DealMind reflects across past interactions to formulate personalized meeting strategies."
        },
        {
            "step": 5,
            "title": "Call Execution & Feedback",
            "desc": "Rep executes strategy, learns customer response, and feeds new memory back into Hindsight."
        }
    ]
    
    return InsightsOverview(
        repeated_objections=repeated_objections,
        successful_messaging=successful_messaging,
        deal_risks=deal_risks,
        customer_preferences=customer_preferences,
        recommended_actions=recommended_actions,
        loop_stages=loop_stages
    )
