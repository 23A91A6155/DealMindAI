import json
import uuid
import logging
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException

from backend.database.db import get_db
from backend.models.schemas import StakeholderNode, StakeholderGraphData

router = APIRouter(prefix="/api/stakeholders", tags=["Stakeholder Memory Graph"])
logger = logging.getLogger(__name__)

def _row_to_stakeholder(r, strategies_rows=[]) -> StakeholderNode:
    priorities = json.loads(r["priorities_json"]) if r["priorities_json"] else []
    objections = json.loads(r["objections_json"]) if r["objections_json"] else []
    preferences = json.loads(r["preferences_json"]) if r["preferences_json"] else []
    relationships = json.loads(r["relationships_json"]) if r["relationships_json"] else []

    presented = []
    for s in strategies_rows:
        if s.get("stakeholder_id") == r["id"] or r["name"] in (s.get("stakeholder_name") or ""):
            presented.append({
                "strategy_id": s["id"],
                "strategy_type": s["strategy_type"],
                "description": s["strategy_description"],
                "outcome": s["observed_outcome"],
                "date": s["date_attempted"],
                "response": s["customer_response"]
            })

    return StakeholderNode(
        id=r["id"],
        customer_id=r["customer_id"],
        name=r["name"],
        role=r["role"],
        email=r["email"],
        influence_level=r["influence_level"] or "Medium",
        decision_power=r["decision_power"] or "Influencer",
        priorities=priorities,
        objections=objections,
        preferences=preferences,
        relationships=relationships,
        last_interaction_date=r["last_interaction_date"],
        strategies_presented=presented
    )

@router.get("/customer/{customer_id}", response_model=List[StakeholderNode])
async def list_customer_stakeholders(customer_id: str):
    """Retrieve all documented stakeholders for an account with verified priorities."""
    async with get_db() as db:
        stk_rows = await (await db.execute(
            "SELECT * FROM stakeholder_nodes WHERE customer_id = ? ORDER BY name ASC",
            (customer_id,)
        )).fetchall()

        strat_rows = await (await db.execute(
            "SELECT * FROM strategies WHERE customer_id = ?",
            (customer_id,)
        )).fetchall()
        strat_dicts = [dict(s) for s in strat_rows]

        return [_row_to_stakeholder(r, strat_dicts) for r in stk_rows]

@router.get("/customer/{customer_id}/graph", response_model=StakeholderGraphData)
async def get_stakeholder_graph(customer_id: str):
    """
    Returns graph payload with account central hub, stakeholder nodes, and verified relationship edges.
    Used by the interactive SVG Stakeholder Memory Graph.
    """
    async with get_db() as db:
        c_row = await (await db.execute("SELECT * FROM customers WHERE id = ?", (customer_id,))).fetchone()
        if not c_row:
            raise HTTPException(status_code=404, detail="Customer not found")

        stk_rows = await (await db.execute(
            "SELECT * FROM stakeholder_nodes WHERE customer_id = ?",
            (customer_id,)
        )).fetchall()

        strat_rows = await (await db.execute(
            "SELECT * FROM strategies WHERE customer_id = ?",
            (customer_id,)
        )).fetchall()
        strat_dicts = [dict(s) for s in strat_rows]

    account_node = {
        "id": f"acc-{customer_id}",
        "label": c_row["name"],
        "domain": c_row["domain"],
        "deal_value": c_row["deal_value"],
        "deal_stage": c_row["deal_stage"],
        "type": "account"
    }

    nodes = []
    edges = []

    for r in stk_rows:
        node_obj = _row_to_stakeholder(r, strat_dicts)
        node_id = f"stk-{r['id']}"

        nodes.append({
            "id": node_id,
            "raw_id": r["id"],
            "name": r["name"],
            "role": r["role"],
            "email": r["email"],
            "influence_level": r["influence_level"],
            "decision_power": r["decision_power"],
            "priorities": node_obj.priorities,
            "objections": node_obj.objections,
            "preferences": node_obj.preferences,
            "strategies_count": len(node_obj.strategies_presented),
            "strategies_presented": node_obj.strategies_presented,
            "last_interaction_date": r["last_interaction_date"],
            "type": "stakeholder"
        })

        # Connect account hub to stakeholder
        edges.append({
            "source": account_node["id"],
            "target": node_id,
            "label": r["decision_power"],
            "type": "account_member"
        })

        # Inter-stakeholder relationships
        relationships = json.loads(r["relationships_json"]) if r["relationships_json"] else []
        for rel in relationships:
            target_name = rel.get("target")
            target_node = next((s for s in stk_rows if s["name"] == target_name), None)
            if target_node:
                edges.append({
                    "source": node_id,
                    "target": f"stk-{target_node['id']}",
                    "label": rel.get("type", "interacts_with").replace("_", " "),
                    "type": "inter_stakeholder"
                })

    return StakeholderGraphData(
        account_node=account_node,
        nodes=nodes,
        edges=edges
    )

@router.get("/{stakeholder_id}/history")
async def get_stakeholder_history(stakeholder_id: str):
    """Detailed historical interaction log and strategy response history for a specific stakeholder."""
    async with get_db() as db:
        stk = await (await db.execute("SELECT * FROM stakeholder_nodes WHERE id = ?", (stakeholder_id,))).fetchone()
        if not stk:
            raise HTTPException(status_code=404, detail="Stakeholder not found")

        # Find meetings with this stakeholder name
        name = stk["name"]
        customer_id = stk["customer_id"]
        inter_rows = await (await db.execute(
            "SELECT * FROM interactions WHERE customer_id = ? AND (contact_name LIKE ? OR notes LIKE ?) ORDER BY date DESC",
            (customer_id, f"%{name}%", f"%{name}%")
        )).fetchall()

        strat_rows = await (await db.execute(
            "SELECT * FROM strategies WHERE customer_id = ? AND (stakeholder_id = ? OR stakeholder_name LIKE ?) ORDER BY date_attempted DESC",
            (customer_id, stakeholder_id, f"%{name}%")
        )).fetchall()

    return {
        "stakeholder": _row_to_stakeholder(stk),
        "meetings_count": len(inter_rows),
        "meetings": [
            {
                "id": r["id"],
                "date": r["date"],
                "type": r["interaction_type"],
                "notes": r["notes"],
                "outcome": r["outcome"]
            }
            for r in inter_rows
        ],
        "strategies": [
            {
                "id": s["id"],
                "type": s["strategy_type"],
                "description": s["strategy_description"],
                "outcome": s["observed_outcome"],
                "response": s["customer_response"],
                "date": s["date_attempted"]
            }
            for s in strat_rows
        ]
    }
