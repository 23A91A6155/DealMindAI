import logging
from typing import List, Dict, Any
from backend.services.hindsight_service import hindsight_service
from backend.models.schemas import DemoStep, BeforeVsAfter

logger = logging.getLogger(__name__)

class DemoService:
    """
    Manages the Hackathon Learning Curve Demo.
    Demonstrates the before/after learning progression over 5 distinct interactions.
    Shows the judge how DealMind transforms from a generic assistant into a personalized intelligence copilot.
    """

    def get_before_vs_after(self) -> BeforeVsAfter:
        """Returns the side-by-side comparison of Generic AI vs DealMind with Hindsight."""
        return BeforeVsAfter(
            scenario="Preparing strategy for upcoming executive meeting with Acme Corp",
            generic_ai=(
                "Understand the customer's needs, address their concerns proactively, discuss the return on investment "
                "of your platform, and clearly explain your product's competitive advantages to win the deal."
            ),
            dealmind_hindsight=(
                "Lead with migration ROI and the 4.2x payback metrics because Acme previously responded positively to financial "
                "evidence. Prepare SOC2 Type II and ISO 27001 documentation for CTO Marcus Vance to eliminate Competitor X, "
                "address implementation downtime risk with our blue/green cutover SLA, and propose an annual flat fee to solve "
                "Procurement VP David Keller's budget objections."
            ),
            supporting_memories=[
                "Sep 18: Evaluating Competitor X for cloud ERP migration",
                "Sep 20: CTO Marcus Vance requires SOC2/ISO 27001 & fears downtime",
                "Sep 23: Procurement VP David Keller flagged $180k cost & wants annual flat fee",
                "Sep 25: 4.2x manufacturing ROI case study received enthusiastic stakeholder praise"
            ]
        )

    async def run_full_demo_sequence(self) -> List[DemoStep]:
        """
        Executes the 5-step learning curve sequence.
        Retains memories at each step and evaluates the resulting intelligence.
        """
        steps_data = [
            {
                "step_number": 1,
                "step_title": "First Interaction (Zero Deal Context)",
                "customer_name": "Acme Corp",
                "input_text": "We are interested in your platform but migration cost is a major concern.",
                "action_type": "retain",
                "agent_output": (
                    "Thank you for reaching out! Our platform provides enterprise-grade cloud modernization. "
                    "We offer scalable pricing models and our solutions architecture team can assist with migration planning. "
                    "Would you like to schedule an introductory call to review our feature matrix?"
                ),
                "memory_retained": "Acme Corp expressed initial interest in platform modernization, but cited migration cost as an early friction point."
            },
            {
                "step_number": 2,
                "step_title": "Second Interaction (Competitive Context)",
                "customer_name": "Acme Corp",
                "input_text": "Our engineering team is also comparing you with Competitor X.",
                "action_type": "retain",
                "agent_output": (
                    "Noted. Competitor X is a legacy platform. We generally recommend highlighting our modern architecture and reliability. "
                    "I have retained that Competitor X is an active evaluation competitor for Acme Corp."
                ),
                "memory_retained": "Engineering team is concurrently evaluating Competitor X; direct architectural differentiation required."
            },
            {
                "step_number": 3,
                "step_title": "Third Interaction (Executive & Security Constraints)",
                "customer_name": "Acme Corp",
                "input_text": "Our CTO cares strongly about security compliance and implementation risk.",
                "action_type": "retain",
                "agent_output": (
                    "Understood. Security compliance is critical for enterprise deals. "
                    "I have registered that Acme's CTO prioritizes security certifications and implementation risk mitigation."
                ),
                "memory_retained": "CTO Marcus Vance requires verified SOC2/ISO 27001 certifications and mitigation guarantees against migration downtime."
            },
            {
                "step_number": 4,
                "step_title": "Fourth Interaction (Customer Preference Discovered)",
                "customer_name": "Acme Corp",
                "input_text": "The ROI case study you shared was useful. We want concrete financial impact.",
                "action_type": "retain",
                "agent_output": (
                    "Excellent feedback. Acme's buying team is responsive to quantified financial ROI evidence rather than marketing collateral. "
                    "Retained into DealMind memory."
                ),
                "memory_retained": "Customer responded enthusiastically to peer ROI case study; prioritizes quantified financial impact models over vendor marketing."
            },
            {
                "step_number": 5,
                "step_title": "Fifth Step: Ask DealMind The Strategy Question",
                "customer_name": "Acme Corp",
                "input_text": "How should I approach my next meeting with Acme Corp?",
                "action_type": "reflect",
                "agent_output": (
                    "🎯 **DealMind Memory-Powered Strategic Gameplan for Acme Corp**:\n\n"
                    "1. **Lead With Proven Financial ROI**: Start the meeting with a tailored 4.2x payback migration analysis. Acme responded positively to hard financial data in previous interactions.\n"
                    "2. **Address Migration Cost Proactively**: Do not wait for Procurement to raise the cost objection again. Present our bundled migration engineering package with fixed pricing.\n"
                    "3. **Neutralize Competitor X via Security**: Present our SOC2 Type II and ISO 27001 compliance packet to satisfy CTO Marcus Vance's mandate, contrasting our blue/green zero-downtime architecture against Competitor X.\n"
                    "4. **Mitigate Implementation Risk**: Guarantee a zero-downtime cutover window backed by our enterprise SLA to relieve engineering fears."
                ),
                "memory_retained": None
            }
        ]

        # Execute retention in Hindsight service
        accumulated_count = len(hindsight_service._demo_memories)
        results = []
        for s in steps_data:
            if s["action_type"] == "retain" and s["memory_retained"]:
                await hindsight_service.retain_interaction(
                    customer_id="cust-acme",
                    content=s["memory_retained"],
                    interaction_type="Demo Interaction",
                    category="Demo Learning",
                    importance="High"
                )
                accumulated_count += 1
            
            results.append(DemoStep(
                step_number=s["step_number"],
                step_title=s["step_title"],
                customer_name=s["customer_name"],
                input_text=s["input_text"],
                action_type=s["action_type"],
                agent_output=s["agent_output"],
                memory_retained=s["memory_retained"],
                accumulated_memory_count=accumulated_count
            ))

        return results

    async def reset_demo(self) -> Dict[str, str]:
        """Resets demo memories to initial baseline."""
        # Keep non-demo initial memories
        hindsight_service._demo_memories = [
            m for m in hindsight_service._demo_memories
            if not m.get("category") == "Demo Learning"
        ]
        return {"status": "success", "message": "Demo memory state successfully reset to baseline."}

# Global singleton
demo_service = DemoService()
