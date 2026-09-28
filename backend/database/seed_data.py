import aiosqlite
import json
import logging
from backend.database.db import get_db

logger = logging.getLogger(__name__)

INITIAL_CUSTOMERS = [
    {
        "id": "cust-acme",
        "name": "Acme Corp",
        "domain": "acmecorp.com",
        "overview": "Fortune 500 manufacturing conglomerate modernizing legacy on-premises ERP systems and supply chain infrastructure.",
        "deal_value": 180000.0,
        "deal_stage": "Negotiation",
        "deal_probability": 68,
        "snapshot": {
            "industry": "Enterprise Manufacturing & Supply Chain",
            "company_size": "8,500 employees",
            "current_solution": "Legacy monolithic on-premises Oracle ERP & custom scripts",
            "main_pain_points": [
                "High migration downtime risk",
                "Vendor lock-in concerns",
                "Strict SOC2 Type II & ISO 27001 compliance standards"
            ],
            "decision_makers": [
                "Sarah Lin (VP of Engineering)",
                "Marcus Vance (Chief Technology Officer)",
                "David Keller (VP of Procurement)"
            ],
            "budget_range": "$150,000 - $220,000 ARR",
            "buying_timeline": "Q4 FY2026 deployment"
        },
        "known_preferences": [
            "Prefers concrete technical proof and architecture diagrams over marketing slides",
            "Values quantified ROI models and enterprise migration timelines",
            "Responds very well to reference case studies from manufacturing peers"
        ],
        "known_objections": [
            "Migration complexity & transition downtime",
            "Upfront implementation and professional services costs",
            "Security compliance certifications verification"
        ],
        "competitors_mentioned": [
            "Competitor X (Enterprise Suite)",
            "Competitor Y (Legacy Modernizer)"
        ],
        "contacts": [
            {"id": "cnt-1", "name": "Sarah Lin", "role": "VP of Engineering", "email": "sarah.lin@acmecorp.com", "priority": "Technical Evaluator"},
            {"id": "cnt-2", "name": "Marcus Vance", "role": "Chief Technology Officer", "email": "m.vance@acmecorp.com", "priority": "Executive Sponsor / Decision Maker"},
            {"id": "cnt-3", "name": "David Keller", "role": "VP of Procurement", "email": "dkeller@acmecorp.com", "priority": "Procurement Stakeholder"}
        ],
        "deals": [
            {"id": "deal-1", "title": "Enterprise Cloud Modernization & Intelligence", "value": 180000.0, "stage": "Negotiation", "probability": 68},
            {"id": "deal-2", "title": "Supply Chain Real-Time Analytics Add-on", "value": 45000.0, "stage": "Discovery", "probability": 30}
        ]
    },
    {
        "id": "cust-technova",
        "name": "TechNova",
        "domain": "technova.io",
        "overview": "Fast-growing AI infrastructure startup scaling distributed inference endpoints for computer vision models.",
        "deal_value": 95000.0,
        "deal_stage": "Discovery",
        "deal_probability": 42,
        "snapshot": {
            "industry": "AI / Deep Learning Infrastructure",
            "company_size": "240 engineers",
            "current_solution": "Self-hosted Kubernetes clusters on bare-metal and AWS spot instances",
            "main_pain_points": [
                "GPU cluster underutilization during off-peak hours",
                "Lack of unified telemetry across hybrid clusters"
            ],
            "decision_makers": [
                "Dr. Aris Thorne (Head of Infrastructure)",
                "Elena Rostov (VP of Product)"
            ],
            "budget_range": "$80,000 - $120,000 ARR",
            "buying_timeline": "Within 45 days"
        },
        "known_preferences": [
            "Requires CLI/Terraform first developer ergonomics",
            "Prioritizes low-latency API benchmarks",
            "Requests monthly billing flexibility instead of annual lock-in"
        ],
        "known_objections": [
            "Pricing per GPU hour markup",
            "API rate limit headroom during traffic spikes"
        ],
        "competitors_mentioned": [
            "InferaCloud",
            "ScaleGrid AI"
        ],
        "contacts": [
            {"id": "cnt-4", "name": "Dr. Aris Thorne", "role": "Head of Infrastructure", "email": "aris@technova.io", "priority": "Decision Maker"},
            {"id": "cnt-5", "name": "Elena Rostov", "role": "VP of Product", "email": "elena@technova.io", "priority": "Evaluator"}
        ],
        "deals": [
            {"id": "deal-3", "title": "Autonomous GPU Infrastructure Intelligence", "value": 95000.0, "stage": "Discovery", "probability": 42}
        ]
    },
    {
        "id": "cust-globex",
        "name": "Globex Logistics",
        "domain": "globexlogistics.com",
        "overview": "International multi-modal freight forwarder operating cross-dock facilities across 14 countries.",
        "deal_value": 240000.0,
        "deal_stage": "Proposal",
        "deal_probability": 55,
        "snapshot": {
            "industry": "Global Transportation & Logistics",
            "company_size": "12,000 employees",
            "current_solution": "Hybrid AS/400 mainframe with EDI integrations",
            "main_pain_points": [
                "Delayed customs paperwork processing",
                "High error rate in cargo manifests"
            ],
            "decision_makers": [
                "Carlos Mendez (Chief Operating Officer)",
                "Rachel Green (Director of IT Operations)"
            ],
            "budget_range": "$200,000 - $300,000 ARR",
            "buying_timeline": "End of Q3"
        },
        "known_preferences": [
            "Values dedicated 24/7 technical account manager and SLA guarantees",
            "Demands guaranteed 99.99% uptime with financial penalties",
            "Prefers staged rollout across pilot hubs in Singapore and Rotterdam"
        ],
        "known_objections": [
            "Staff retraining friction on legacy warehouse teams",
            "Customs compliance certification across regional authorities"
        ],
        "competitors_mentioned": [
            "LogiStream Prime",
            "FreightVantage"
        ],
        "contacts": [
            {"id": "cnt-6", "name": "Carlos Mendez", "role": "COO", "email": "carlos.mendez@globexlogistics.com", "priority": "Executive Sponsor"},
            {"id": "cnt-7", "name": "Rachel Green", "role": "Director of IT Operations", "email": "rachel.g@globexlogistics.com", "priority": "Technical Evaluator"}
        ],
        "deals": [
            {"id": "deal-4", "title": "Global Customs & Manifest AI Modernization", "value": 240000.0, "stage": "Proposal", "probability": 55},
            {"id": "deal-5", "title": "Warehouse Robotics IoT Connector Pilot", "value": 60000.0, "stage": "Discovery", "probability": 35}
        ]
    },
    {
        "id": "cust-vertex",
        "name": "Vertex Financial Systems",
        "domain": "vertexfin.com",
        "overview": "Tier-2 fintech institution handling securities clearing and automated algorithmic trade reconciliation.",
        "deal_value": 310000.0,
        "deal_stage": "Negotiation",
        "deal_probability": 75,
        "snapshot": {
            "industry": "Financial Technology & Capital Markets",
            "company_size": "3,200 employees",
            "current_solution": "In-house C++ clearing engine with Apache Kafka bus",
            "main_pain_points": [
                "Real-time fraud anomaly false positives",
                "Audit trail retention overhead for SEC compliance"
            ],
            "decision_makers": [
                "Victoria Sterling (Chief Risk Officer)",
                "Jonathan Blake (Head of Trading Infrastructure)"
            ],
            "budget_range": "$250,000 - $350,000 ARR",
            "buying_timeline": "Immediate contract signing pending legal review"
        },
        "known_preferences": [
            "Zero cloud egress of raw PII financial payload (on-prem or VPC enclave)",
            "Auditable cryptographic verification for every AI inference",
            "Fast dispute resolution support"
        ],
        "known_objections": [
            "Liability terms in standard master services agreement (MSA)",
            "Third-party penetration test audit results pending"
        ],
        "competitors_mentioned": [
            "QuantShield Systems"
        ],
        "contacts": [
            {"id": "cnt-8", "name": "Victoria Sterling", "role": "Chief Risk Officer", "email": "v.sterling@vertexfin.com", "priority": "Executive Decision Maker"},
            {"id": "cnt-9", "name": "Jonathan Blake", "role": "Head of Trading Infra", "email": "jblake@vertexfin.com", "priority": "Technical Evaluator"}
        ],
        "deals": [
            {"id": "deal-6", "title": "Institutional Trade Surveillance & Audit Copilot", "value": 310000.0, "stage": "Negotiation", "probability": 75}
        ]
    },
    {
        "id": "cust-bluepeak",
        "name": "BluePeak HealthTech",
        "domain": "bluepeakhealth.org",
        "overview": "Healthcare analytics provider processing electronic health records (EHR) and telehealth scheduling for hospital networks.",
        "deal_value": 145000.0,
        "deal_stage": "Discovery",
        "deal_probability": 35,
        "snapshot": {
            "industry": "Healthcare & Life Sciences",
            "company_size": "1,100 healthcare specialists",
            "current_solution": "Epic EHR integrated with legacy Citrix application servers",
            "main_pain_points": [
                "Physician burnout from manual clinical documentation",
                "HIPAA and BAA compliance enforcement across remote staff"
            ],
            "decision_makers": [
                "Dr. Leonard Cho (Chief Medical Officer)",
                "Patricia Hall (VP of Compliance & Legal)"
            ],
            "budget_range": "$120,000 - $160,000 ARR",
            "buying_timeline": "Q1 next fiscal year"
        },
        "known_preferences": [
            "Must execute Business Associate Agreement (BAA) before POC",
            "Needs frictionless speech-to-text integration into clinician tablets",
            "Requires peer-reviewed clinical accuracy metrics"
        ],
        "known_objections": [
            "Physician resistance to new interface software",
            "High compliance penalties if PHI leaks"
        ],
        "competitors_mentioned": [
            "MediScribe AI",
            "CareFlow Health"
        ],
        "contacts": [
            {"id": "cnt-10", "name": "Dr. Leonard Cho", "role": "Chief Medical Officer", "email": "lcho@bluepeakhealth.org", "priority": "Decision Maker"},
            {"id": "cnt-11", "name": "Patricia Hall", "role": "VP Compliance", "email": "phall@bluepeakhealth.org", "priority": "Legal / Compliance"}
        ],
        "deals": [
            {"id": "deal-7", "title": "Clinical Workflow Copilot & Telemetry", "value": 145000.0, "stage": "Discovery", "probability": 35}
        ]
    }
]

# Initial rich interactions (Acme Corp has the core coherent 6-step storyline, plus interactions for other customers)
INITIAL_INTERACTIONS = [
    # Acme Corp coherent 6-step storyline
    {
        "id": "int-acme-1",
        "customer_id": "cust-acme",
        "contact_name": "Sarah Lin",
        "date": "2026-09-18",
        "interaction_type": "Discovery Call",
        "notes": "Met with Sarah Lin (VP Engineering). Acme wants cloud modernization for legacy ERP. Mentioned they are also actively evaluating Competitor X for their suite capabilities.",
        "outcome": "Customer showed high interest in architecture simplification, but wants to compare vs Competitor X.",
        "objections": ["Evaluating Competitor X"],
        "competitors": ["Competitor X"],
        "next_action": "Prepare comparison matrix and schedule deep-dive technical session.",
        "retained_memory": "Acme Corp is evaluating cloud modernization for ERP. They are simultaneously evaluating Competitor X and need direct competitive differentiation.",
        "category": "Competitor",
        "importance": "High"
    },
    {
        "id": "int-acme-2",
        "customer_id": "cust-acme",
        "contact_name": "Marcus Vance",
        "date": "2026-09-20",
        "interaction_type": "Technical Meeting",
        "notes": "CTO Marcus Vance joined. Emphasized that security compliance (SOC2 Type II, ISO 27001) is non-negotiable. Expressed concern over transition risks and unexpected system downtime.",
        "outcome": "Marcus requested whitepapers on security architecture and disaster recovery guarantees.",
        "objections": ["Security compliance standards", "Implementation downtime risk"],
        "competitors": [],
        "next_action": "Send security whitepaper, ISO audit certificate, and migration failover architecture diagrams.",
        "retained_memory": "Acme CTO Marcus Vance prioritizes strict SOC2 Type II and ISO 27001 security compliance. Implementation downtime risk is a primary executive friction point.",
        "category": "Objection",
        "importance": "High"
    },
    {
        "id": "int-acme-3",
        "customer_id": "cust-acme",
        "contact_name": "David Keller",
        "date": "2026-09-23",
        "interaction_type": "Pricing Discussion",
        "notes": "Call with David Keller (Procurement). David indicated that initial $180k proposal is viewed as steep when factoring in migration engineering services. Requested annual flat licensing instead of consumption tiers.",
        "outcome": "Procurement pushed back on migration costs; wants commercial justification.",
        "objections": ["Migration cost too high", "Upfront professional services cost"],
        "competitors": [],
        "next_action": "Work with solutions engineering to provide an all-inclusive migration package with clear payback period.",
        "retained_memory": "Acme Procurement VP David Keller considers initial migration cost too high and requested annual flat pricing structure with ROI proof.",
        "category": "Pricing",
        "importance": "High"
    },
    {
        "id": "int-acme-4",
        "customer_id": "cust-acme",
        "contact_name": "Sarah Lin",
        "date": "2026-09-25",
        "interaction_type": "Follow-up",
        "notes": "Shared the Heavy Industry Manufacturing ROI case study with Sarah Lin showing 4.2x payback in 9 months. Sarah responded enthusiastically and forwarded it directly to the CTO and Procurement team.",
        "outcome": "Substantial positive momentum. Customer explicitly values concrete financial ROI evidence over generic vendor decks.",
        "objections": [],
        "competitors": [],
        "next_action": "Schedule executive alignment meeting with Marcus Vance and David Keller.",
        "retained_memory": "Acme responded very positively when shared a concrete peer ROI migration case study showing 4.2x payback. They strongly prefer quantified financial metrics over marketing decks.",
        "category": "Preference",
        "importance": "High"
    },
    {
        "id": "int-acme-5",
        "customer_id": "cust-acme",
        "contact_name": "Marcus Vance",
        "date": "2026-09-26",
        "interaction_type": "Demo",
        "notes": "Conducted live architecture walkthrough focusing on zero-downtime blue/green migration and SOC2 enclave protection. Marcus agreed our security model surpasses Competitor X.",
        "outcome": "CTO satisfied on technical architecture; agreed to review final proposal next week.",
        "objections": [],
        "competitors": ["Competitor X"],
        "next_action": "Submit final contract proposal with migration SLA warranty.",
        "retained_memory": "CTO Marcus Vance validated that our zero-downtime architecture and SOC2 security model beat Competitor X. Final deal hurdle is purely commercial terms with Procurement.",
        "category": "Strategy",
        "importance": "High"
    },

    # TechNova interactions
    {
        "id": "int-tech-1",
        "customer_id": "cust-technova",
        "contact_name": "Dr. Aris Thorne",
        "date": "2026-09-19",
        "interaction_type": "Discovery Call",
        "notes": "Aris explained their GPU cluster costs jumped 180% this quarter. Looking for intelligent telemetry and cluster autoscaling. Testing InferaCloud concurrently.",
        "outcome": "Interested in 14-day telemetry pilot.",
        "objections": ["Testing InferaCloud", "High hourly markup"],
        "competitors": ["InferaCloud"],
        "next_action": "Set up sandbox API credentials for Terraform provider.",
        "retained_memory": "TechNova Head of Infra Aris Thorne is testing InferaCloud. Primary pain point is 180% GPU cost surge; demands Terraform-first integration and transparent hourly rates.",
        "category": "Competitor",
        "importance": "High"
    },
    {
        "id": "int-tech-2",
        "customer_id": "cust-technova",
        "contact_name": "Elena Rostov",
        "date": "2026-09-22",
        "interaction_type": "Technical Review",
        "notes": "Reviewed API benchmark results. Our latency was 14ms vs InferaCloud's 28ms. Elena was impressed with throughput under simulated load.",
        "outcome": "Benchmarking passed; requested monthly rolling subscription.",
        "objections": [],
        "competitors": ["InferaCloud"],
        "next_action": "Provide monthly rolling tier proposal.",
        "retained_memory": "TechNova confirmed our API latency (14ms) doubled the speed of InferaCloud. Prefers monthly billing to maintain flexibility.",
        "category": "Preference",
        "importance": "Medium"
    },

    # Globex Logistics interactions
    {
        "id": "int-globex-1",
        "customer_id": "cust-globex",
        "contact_name": "Carlos Mendez",
        "date": "2026-09-15",
        "interaction_type": "Discovery Call",
        "notes": "Meeting with COO Carlos Mendez. Customs delays in Rotterdam and Singapore cost Globex $40k/week in demurrage. LogiStream Prime pitch failed due to slow integration.",
        "outcome": "High urgency to solve customs documentation lag.",
        "objections": ["LogiStream Prime previous failure caused internal hesitation"],
        "competitors": ["LogiStream Prime"],
        "next_action": "Draft 2-hub pilot proposal for Singapore and Rotterdam.",
        "retained_memory": "Globex COO Carlos Mendez prioritizes customs clearance automation. Skeptical due to prior failed pilot with LogiStream Prime; demands phased 2-hub rollout with 24/7 TAM.",
        "category": "Objection",
        "importance": "High"
    },
    {
        "id": "int-globex-2",
        "customer_id": "cust-globex",
        "contact_name": "Rachel Green",
        "date": "2026-09-24",
        "interaction_type": "Proposal",
        "notes": "Presented phased deployment plan with guaranteed 99.99% uptime SLA. Rachel confirmed AS/400 connector architecture met their integration requirements.",
        "outcome": "Proposal moved to executive committee review.",
        "objections": ["Warehouse staff training curve"],
        "competitors": [],
        "next_action": "Provide training workshop curriculum and support SLA contract annex.",
        "retained_memory": "Globex IT Director Rachel Green approved AS/400 connector architecture. Requested dedicated train-the-trainer workshops to mitigate warehouse staff adoption hesitation.",
        "category": "Preference",
        "importance": "High"
    },

    # Vertex Financial interactions
    {
        "id": "int-vertex-1",
        "customer_id": "cust-vertex",
        "contact_name": "Victoria Sterling",
        "date": "2026-09-17",
        "interaction_type": "Executive Briefing",
        "notes": "Chief Risk Officer Victoria Sterling confirmed interest in trade surveillance copilot. Emphasized absolute zero cloud data leakage; data must never leave their AWS VPC.",
        "outcome": "Agreed to VPC enclave deployment architecture.",
        "objections": ["Zero cloud data leakage requirement", "SEC compliance audit trail"],
        "competitors": ["QuantShield Systems"],
        "next_action": "Submit VPC CloudFormation / Terraform templates for security audit.",
        "retained_memory": "Vertex Financial CRO Victoria Sterling mandates customer-managed VPC enclave with cryptographic audit trails. QuantShield Systems was rejected due to multi-tenant cloud storage.",
        "category": "Preference",
        "importance": "High"
    },
    {
        "id": "int-vertex-2",
        "customer_id": "cust-vertex",
        "contact_name": "Jonathan Blake",
        "date": "2026-09-25",
        "interaction_type": "Technical Review",
        "notes": "Jonathan Blake completed static code analysis and penetration test review. Architecture passed without critical findings.",
        "outcome": "Technical sign-off achieved. Sent to legal for final contract execution.",
        "objections": [],
        "competitors": [],
        "next_action": "Coordinate with legal on standard MSA indemnification clause.",
        "retained_memory": "Vertex Financial completed security penetration review with zero findings. Contract is in legal review ($310,000 ARR).",
        "category": "Milestone",
        "importance": "High"
    }
]
INITIAL_STRATEGIES = [
    {
        "id": "strat-acme-1",
        "customer_id": "cust-acme",
        "interaction_id": "int-3",
        "stakeholder_id": "cnt-3",
        "stakeholder_name": "David Keller (VP Procurement)",
        "strategy_type": "ROI presentation",
        "strategy_description": "Presented a verified 4.2x peer ROI payback analysis across a 3-year migration lifecycle.",
        "objection_addressed": "Upfront implementation and professional services costs",
        "supporting_materials": "Automotive Manufacturing Peer Modernization TCO Whitepaper",
        "date_attempted": "2026-08-28",
        "salesperson_notes": "Keller was skeptical initially of hourly rate cards. Emphasized amortized total cost of ownership.",
        "customer_response": "Procurement requested formal proposal with fixed annual packaging rather than variable billing.",
        "observed_outcome": "SUCCESSFUL",
        "outcome_confidence": 0.94,
        "evidence_references": ["int-3", "mem-cust-acme-3"],
        "follow_up_actions": "Deliver fixed-fee Statement of Work with capped migration engineering hours."
    },
    {
        "id": "strat-acme-2",
        "customer_id": "cust-acme",
        "interaction_id": "int-4",
        "stakeholder_id": "cnt-1",
        "stakeholder_name": "Sarah Lin (VP Engineering)",
        "strategy_type": "Discount negotiation",
        "strategy_description": "Attempted 15% upfront discount incentive if contract executed by end of Q3 without architectural review.",
        "objection_addressed": "Budget envelope and purchase timeline",
        "supporting_materials": "End-of-Quarter Enterprise Pricing Schedule",
        "date_attempted": "2026-09-12",
        "salesperson_notes": "Tried to accelerate closing velocity using price discounting.",
        "customer_response": "Sarah Lin firmly pushed back. Emphasized that pricing is secondary to zero downtime guarantees on the shop floor.",
        "observed_outcome": "UNSUCCESSFUL",
        "outcome_confidence": 0.92,
        "evidence_references": ["int-4", "mem-cust-acme-4"],
        "follow_up_actions": "Never offer price concessions without architectural cutover assurance."
    },
    {
        "id": "strat-acme-3",
        "customer_id": "cust-acme",
        "interaction_id": "int-2",
        "stakeholder_id": "cnt-1",
        "stakeholder_name": "Sarah Lin & Marcus Vance",
        "strategy_type": "Technical case study",
        "strategy_description": "Walked through blue/green zero-downtime cutover architecture with peer industrial manufacturing case study.",
        "objection_addressed": "Manufacturing shop floor downtime and cutover risks",
        "supporting_materials": "Live Automated Cutover Architecture Diagram & Failover Logs",
        "date_attempted": "2026-08-14",
        "salesperson_notes": "Focused heavily on technical evidence instead of marketing pitch deck.",
        "customer_response": "Marcus Vance agreed that blue/green architecture mitigates primary operational risks.",
        "observed_outcome": "SUCCESSFUL",
        "outcome_confidence": 0.96,
        "evidence_references": ["int-2", "mem-cust-acme-2"],
        "follow_up_actions": "Provide SOC2 Type II and ISO 27001 audit attestation packet."
    },
    {
        "id": "strat-acme-4",
        "customer_id": "cust-acme",
        "interaction_id": "int-5",
        "stakeholder_id": "cnt-2",
        "stakeholder_name": "Marcus Vance (CTO)",
        "strategy_type": "Competitor comparison",
        "strategy_description": "Contrasted native Hindsight persistent memory against Competitor X batch sync and legacy maintenance costs.",
        "objection_addressed": "Active RFP evaluation of Competitor X",
        "supporting_materials": "Feature & Architectural Matrix: DealMind vs Competitor X",
        "date_attempted": "2026-09-22",
        "salesperson_notes": "Marcus acknowledged Competitor X has high maintenance overhead, but requested verified security attestation.",
        "customer_response": "Acknowledged differentiation; deferred final sign-off pending security certification review.",
        "observed_outcome": "PARTIALLY_SUCCESSFUL",
        "outcome_confidence": 0.88,
        "evidence_references": ["int-5", "mem-cust-acme-5"],
        "follow_up_actions": "Send SOC2 Type II audit report directly to CISO & Marcus Vance."
    },
    {
        "id": "strat-technova-1",
        "customer_id": "cust-technova",
        "interaction_id": "int-6",
        "stakeholder_id": "cnt-4",
        "stakeholder_name": "Dr. Aris Thorne (Head of Infrastructure)",
        "strategy_type": "Pilot proposal",
        "strategy_description": "Offered a 14-day dedicated GPU cluster latency benchmark comparing response times against InferaCloud.",
        "objection_addressed": "Latency and throughput headroom concerns",
        "supporting_materials": "OpenAPI / Terraform Benchmark Repository",
        "date_attempted": "2026-09-18",
        "salesperson_notes": "Aris ran real model inference workloads; measured 14ms vs InferaCloud 28ms.",
        "customer_response": "Aris expressed high satisfaction with benchmark results.",
        "observed_outcome": "SUCCESSFUL",
        "outcome_confidence": 0.95,
        "evidence_references": ["int-6"],
        "follow_up_actions": "Structure monthly rolling billing terms with VP Product Elena Rostov."
    },
    {
        "id": "strat-vertex-1",
        "customer_id": "cust-vertex",
        "interaction_id": "int-10",
        "stakeholder_id": "cnt-8",
        "stakeholder_name": "Victoria Sterling (Chief Risk Officer)",
        "strategy_type": "Security reassurance",
        "strategy_description": "Demonstrated customer-managed VPC enclave with cryptographic zero-egress audit verification.",
        "objection_addressed": "Cloud egress of raw PII financial payload",
        "supporting_materials": "Cryptographic Non-Egress Whitepaper & Architecture Spec",
        "date_attempted": "2026-09-21",
        "salesperson_notes": "Victoria praised isolated architecture; eliminated multi-tenant cloud risk.",
        "customer_response": "Risk office cleared architecture; advanced deal to formal MSA negotiation.",
        "observed_outcome": "SUCCESSFUL",
        "outcome_confidence": 0.98,
        "evidence_references": ["int-10"],
        "follow_up_actions": "Resolve standard master service agreement indemnification clause."
    }
]

INITIAL_STAKEHOLDERS = [
    {
        "id": "stk-acme-1",
        "customer_id": "cust-acme",
        "name": "Marcus Vance",
        "role": "Chief Technology Officer",
        "email": "m.vance@acmecorp.com",
        "influence_level": "High",
        "decision_power": "Decision Maker",
        "priorities": ["Zero downtime cutover", "ISO 27001 & SOC2 Type II compliance", "Long-term architectural stability"],
        "objections": ["Migration complexity", "Vendor lock-in"],
        "preferences": ["Architecture whitepapers", "Verifiable security audits", "Technical peer references"],
        "relationships": [{"target": "Sarah Lin", "type": "supervises"}, {"target": "David Keller", "type": "peer_executive"}],
        "last_interaction_date": "2026-09-22"
    },
    {
        "id": "stk-acme-2",
        "customer_id": "cust-acme",
        "name": "Sarah Lin",
        "role": "VP of Engineering",
        "email": "sarah.lin@acmecorp.com",
        "influence_level": "High",
        "decision_power": "Technical Evaluator",
        "priorities": ["Manufacturing shop floor operational continuity", "Low-latency API integration", "Developer ergonomics"],
        "objections": ["Transition downtime", "Complex cutover procedures"],
        "preferences": ["Live technical demos", "Engineering peer references", "Blue/green deployment models"],
        "relationships": [{"target": "Marcus Vance", "type": "reports_to"}],
        "last_interaction_date": "2026-09-12"
    },
    {
        "id": "stk-acme-3",
        "customer_id": "cust-acme",
        "name": "David Keller",
        "role": "VP of Procurement",
        "email": "dkeller@acmecorp.com",
        "influence_level": "Medium",
        "decision_power": "Procurement Stakeholder",
        "priorities": ["Predictable fixed-fee pricing", "Clear ROI payback schedule", "Contractual liability caps"],
        "objections": ["Upfront professional services fees", "Uncapped variable cost overruns"],
        "preferences": ["Multi-year amortized TCO models", "Fixed-fee milestone packaging"],
        "relationships": [{"target": "Marcus Vance", "type": "executive_peer"}],
        "last_interaction_date": "2026-08-28"
    },
    {
        "id": "stk-technova-1",
        "customer_id": "cust-technova",
        "name": "Dr. Aris Thorne",
        "role": "Head of Infrastructure",
        "email": "aris@technova.io",
        "influence_level": "High",
        "decision_power": "Decision Maker",
        "priorities": ["Sub-20ms inference latency", "Terraform-first APIs", "GPU cluster headroom"],
        "objections": ["Pricing markup on compute hours"],
        "preferences": ["CLI/Terraform developer ergonomics", "Direct latency benchmarks"],
        "relationships": [{"target": "Elena Rostov", "type": "co_lead"}],
        "last_interaction_date": "2026-09-18"
    },
    {
        "id": "stk-technova-2",
        "customer_id": "cust-technova",
        "name": "Elena Rostov",
        "role": "VP of Product",
        "email": "elena@technova.io",
        "influence_level": "Medium",
        "decision_power": "Evaluator",
        "priorities": ["Monthly billing flexibility", "Quick time-to-market", "Zero annual commitment"],
        "objections": ["Annual lock-in contracts"],
        "preferences": ["Monthly rolling usage terms", "Self-service dashboard"],
        "relationships": [{"target": "Dr. Aris Thorne", "type": "co_lead"}],
        "last_interaction_date": "2026-09-08"
    }
]

INITIAL_CONTRADICTIONS = [
    {
        "id": "contra-acme-1",
        "customer_id": "cust-acme",
        "topic": "Modernization Capital Expenditure Budget",
        "earlier_statement": "David Keller (VP Procurement) confirmed the $180,000 modernization budget was fully approved for Q4 FY2026 deployment.",
        "earlier_meeting_date": "2026-08-28",
        "earlier_interaction_id": "int-3",
        "latest_statement": "David Keller noted corporate finance has temporarily frozen non-essential capital expenditures pending Q3 earnings review.",
        "latest_meeting_date": "2026-09-22",
        "latest_interaction_id": "int-5",
        "supporting_evidence": "Meeting note int-3 explicitly states 'budget approved'; meeting note int-5 states 'freeze on capital spending'.",
        "confidence": 0.94,
        "status": "NEEDS_CLARIFICATION",
        "recommended_action": "Clarify with Sarah Lin whether the ERP cloud modernization is classified as an essential or non-essential capital expense before presenting final contract terms.",
        "resolution_notes": None
    },
    {
        "id": "contra-technova-1",
        "customer_id": "cust-technova",
        "topic": "Target Deployment Infrastructure",
        "earlier_statement": "TechNova intends to host model inference exclusively on self-managed on-prem bare-metal clusters.",
        "earlier_meeting_date": "2026-09-01",
        "earlier_interaction_id": "int-technova-1",
        "latest_statement": "Aris Thorne confirmed they are expanding inference endpoints into a hybrid model spanning AWS spot instances.",
        "latest_meeting_date": "2026-09-18",
        "latest_interaction_id": "int-technova-2",
        "supporting_evidence": "Shift from pure bare-metal Kubernetes to hybrid AWS cloud integration.",
        "confidence": 0.91,
        "status": "CONFIRMED_CHANGE",
        "recommended_action": "Update deployment architecture proposal to hybrid bare-metal/AWS configuration.",
        "resolution_notes": "Confirmed by Aris Thorne during benchmark review call on Sept 18."
    }
]

INITIAL_EXPERIMENTS = [
    {
        "id": "exp-acme-1",
        "customer_id": "cust-acme",
        "briefing_id": "brf-acme-init",
        "recommended_strategy": "Lead meeting with fixed-fee migration engineering package and 4.2x peer ROI payback schedule to neutralize Procurement friction.",
        "recommendation_date": "2026-09-24",
        "attempted": True,
        "attempt_date": "2026-09-25",
        "stakeholder_name": "David Keller (VP Procurement)",
        "customer_response": "David reacted favorably to fixed-fee cap and requested contract draft.",
        "observed_outcome": "SUCCESSFUL",
        "salesperson_notes": "Removing variable hourly rates unlocked stalled procurement review.",
        "next_action": "Deliver formal Statement of Work with fixed professional services cap."
    }
]

async def seed_database():
    """Populates SQLite database with comprehensive enterprise B2B sales data and outcome records."""
    async with get_db() as db:
        # Check if customers need seeding
        c_count = (await (await db.execute("SELECT COUNT(*) FROM customers")).fetchone())[0]
        if c_count == 0:
            logger.info("Seeding SQLite database with customers, contacts, deals, and interactions...")
            for cust in INITIAL_CUSTOMERS:
                await db.execute(
                    """
                    INSERT INTO customers (
                        id, name, domain, overview, deal_value, deal_stage, deal_probability,
                        snapshot_json, known_preferences_json, known_objections_json, competitors_mentioned_json
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        cust["id"], cust["name"], cust["domain"], cust["overview"], cust["deal_value"],
                        cust["deal_stage"], cust["deal_probability"], json.dumps(cust["snapshot"]),
                        json.dumps(cust["known_preferences"]), json.dumps(cust["known_objections"]),
                        json.dumps(cust["competitors_mentioned"])
                    )
                )

                for cnt in cust["contacts"]:
                    await db.execute(
                        "INSERT INTO contacts (id, customer_id, name, role, email, priority) VALUES (?, ?, ?, ?, ?, ?)",
                        (cnt["id"], cust["id"], cnt["name"], cnt["role"], cnt["email"], cnt["priority"])
                    )

                for deal in cust["deals"]:
                    await db.execute(
                        "INSERT INTO deals (id, customer_id, title, value, stage, probability) VALUES (?, ?, ?, ?, ?, ?)",
                        (deal["id"], cust["id"], deal["title"], deal["value"], deal["stage"], deal["probability"])
                    )

            for inter in INITIAL_INTERACTIONS:
                await db.execute(
                    """
                    INSERT INTO interactions (
                        id, customer_id, contact_name, date, interaction_type, notes,
                        outcome, objections_json, competitors_json, next_action, retained_memory
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        inter["id"], inter["customer_id"], inter["contact_name"], inter["date"],
                        inter["interaction_type"], inter["notes"], inter["outcome"],
                        json.dumps(inter["objections"]), json.dumps(inter["competitors"]),
                        inter["next_action"], inter["retained_memory"]
                    )
                )

        # Seed Strategy DNA if empty
        s_count = (await (await db.execute("SELECT COUNT(*) FROM strategies")).fetchone())[0]
        if s_count == 0:
            logger.info("Seeding Strategy DNA records...")
            for strat in INITIAL_STRATEGIES:
                await db.execute(
                    """
                    INSERT INTO strategies (
                        id, customer_id, interaction_id, stakeholder_id, stakeholder_name,
                        strategy_type, strategy_description, objection_addressed, supporting_materials,
                        date_attempted, salesperson_notes, customer_response, observed_outcome,
                        outcome_confidence, evidence_references_json, follow_up_actions
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        strat["id"], strat["customer_id"], strat["interaction_id"],
                        strat["stakeholder_id"], strat["stakeholder_name"], strat["strategy_type"],
                        strat["strategy_description"], strat["objection_addressed"],
                        strat["supporting_materials"], strat["date_attempted"], strat["salesperson_notes"],
                        strat["customer_response"], strat["observed_outcome"], strat["outcome_confidence"],
                        json.dumps(strat["evidence_references"]), strat["follow_up_actions"]
                    )
                )

        # Seed Stakeholder Nodes if empty
        stk_count = (await (await db.execute("SELECT COUNT(*) FROM stakeholder_nodes")).fetchone())[0]
        if stk_count == 0:
            logger.info("Seeding Stakeholder Graph records...")
            for stk in INITIAL_STAKEHOLDERS:
                await db.execute(
                    """
                    INSERT INTO stakeholder_nodes (
                        id, customer_id, name, role, email, influence_level, decision_power,
                        priorities_json, objections_json, preferences_json, relationships_json,
                        last_interaction_date
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        stk["id"], stk["customer_id"], stk["name"], stk["role"], stk["email"],
                        stk["influence_level"], stk["decision_power"], json.dumps(stk["priorities"]),
                        json.dumps(stk["objections"]), json.dumps(stk["preferences"]),
                        json.dumps(stk["relationships"]), stk["last_interaction_date"]
                    )
                )

        # Seed Contradictions if empty
        c_contra_count = (await (await db.execute("SELECT COUNT(*) FROM contradictions")).fetchone())[0]
        if c_contra_count == 0:
            logger.info("Seeding Contradiction records...")
            for contra in INITIAL_CONTRADICTIONS:
                await db.execute(
                    """
                    INSERT INTO contradictions (
                        id, customer_id, topic, earlier_statement, earlier_meeting_date,
                        earlier_interaction_id, latest_statement, latest_meeting_date,
                        latest_interaction_id, supporting_evidence, confidence, status,
                        recommended_action, resolution_notes
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        contra["id"], contra["customer_id"], contra["topic"],
                        contra["earlier_statement"], contra["earlier_meeting_date"],
                        contra["earlier_interaction_id"], contra["latest_statement"],
                        contra["latest_meeting_date"], contra["latest_interaction_id"],
                        contra["supporting_evidence"], contra["confidence"], contra["status"],
                        contra["recommended_action"], contra["resolution_notes"]
                    )
                )

        # Seed Strategy Experiments if empty
        exp_count = (await (await db.execute("SELECT COUNT(*) FROM strategy_experiments")).fetchone())[0]
        if exp_count == 0:
            logger.info("Seeding Strategy Experiments...")
            for exp in INITIAL_EXPERIMENTS:
                await db.execute(
                    """
                    INSERT INTO strategy_experiments (
                        id, customer_id, briefing_id, recommended_strategy, recommendation_date,
                        attempted, attempt_date, stakeholder_name, customer_response,
                        observed_outcome, salesperson_notes, next_action
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        exp["id"], exp["customer_id"], exp["briefing_id"],
                        exp["recommended_strategy"], exp["recommendation_date"],
                        1 if exp["attempted"] else 0, exp["attempt_date"], exp["stakeholder_name"],
                        exp["customer_response"], exp["observed_outcome"], exp["salesperson_notes"],
                        exp["next_action"]
                    )
                )

        await db.commit()
        logger.info("Database seeding complete.")
