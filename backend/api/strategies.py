import json
import uuid
import logging
from datetime import datetime, date as dt_date
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException

from backend.database.db import get_db
from backend.models.schemas import (
    StrategyAttempt, StrategyCreate, StrategyUpdateOutcome,
    StrategyExperiment, StrategyExperimentUpdate
)
from backend.services.hindsight_service import hindsight_service

router = APIRouter(prefix="/api/strategies", tags=["Strategy DNA"])
logger = logging.getLogger(__name__)

def _row_to_strategy(r) -> StrategyAttempt:
    ev_refs = []
    if r["evidence_references_json"]:
        try:
            ev_refs = json.loads(r["evidence_references_json"])
        except Exception:
            ev_refs = []

    return StrategyAttempt(
        id=r["id"],
        customer_id=r["customer_id"],
        interaction_id=r["interaction_id"],
        stakeholder_id=r["stakeholder_id"],
        stakeholder_name=r["stakeholder_name"],
        strategy_type=r["strategy_type"],
        strategy_description=r["strategy_description"],
        objection_addressed=r["objection_addressed"],
        supporting_materials=r["supporting_materials"],
        date_attempted=r["date_attempted"],
        salesperson_notes=r["salesperson_notes"],
        customer_response=r["customer_response"],
        observed_outcome=r["observed_outcome"],
        outcome_confidence=r["outcome_confidence"] or 0.85,
        evidence_references=ev_refs,
        follow_up_actions=r["follow_up_actions"],
        created_at=r["created_at"],
        updated_at=r["updated_at"]
    )

@router.get("/customer/{customer_id}", response_model=List[StrategyAttempt])
async def list_customer_strategies(customer_id: str):
    """Retrieve all historical sales strategy attempts and their observed outcomes for an account."""
    async with get_db() as db:
        rows = await (await db.execute(
            "SELECT * FROM strategies WHERE customer_id = ? ORDER BY date_attempted DESC, created_at DESC",
            (customer_id,)
        )).fetchall()
        return [_row_to_strategy(r) for r in rows]

@router.get("/customer/{customer_id}/summary")
async def get_customer_strategies_summary(customer_id: str):
    """Returns aggregated count of strategy attempts by outcome."""
    async with get_db() as db:
        rows = await (await db.execute(
            "SELECT observed_outcome, count(*) as cnt FROM strategies WHERE customer_id = ? GROUP BY observed_outcome",
            (customer_id,)
        )).fetchall()
        counts = {r["observed_outcome"]: r["cnt"] for r in rows}
        total = sum(counts.values())
        return {
            "customer_id": customer_id,
            "total_strategies": total,
            "successful": counts.get("SUCCESSFUL", 0),
            "unsuccessful": counts.get("UNSUCCESSFUL", 0),
            "partially_successful": counts.get("PARTIALLY_SUCCESSFUL", 0),
            "not_attempted": counts.get("NOT_ATTEMPTED", 0)
        }

@router.post("", response_model=StrategyAttempt)

async def create_strategy_attempt(payload: StrategyCreate):
    """
    Records a sales strategy attempt with observed customer response and outcome.
    Retains the verified outcome in Hindsight so future AI briefings learn what worked.
    """
    strat_id = f"strat-{uuid.uuid4().hex[:8]}"
    attempt_date = payload.date_attempted or dt_date.today().isoformat()
    now_iso = datetime.utcnow().isoformat()

    async with get_db() as db:
        await db.execute(
            """
            INSERT INTO strategies (
                id, customer_id, interaction_id, stakeholder_id, stakeholder_name,
                strategy_type, strategy_description, objection_addressed, supporting_materials,
                date_attempted, salesperson_notes, customer_response, observed_outcome,
                outcome_confidence, evidence_references_json, follow_up_actions,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                strat_id, payload.customer_id, payload.interaction_id,
                payload.stakeholder_id, payload.stakeholder_name, payload.strategy_type,
                payload.strategy_description, payload.objection_addressed,
                payload.supporting_materials, attempt_date, payload.salesperson_notes,
                payload.customer_response, payload.observed_outcome, payload.outcome_confidence,
                json.dumps(payload.evidence_references), payload.follow_up_actions,
                now_iso, now_iso
            )
        )
        await db.commit()

    # Retain structured outcome into Hindsight
    outcome_summary = (
        f"Strategy Attempt [{payload.strategy_type}]: {payload.strategy_description}. "
        f"Target stakeholder: {payload.stakeholder_name or 'Buying team'}. "
        f"Customer response: {payload.customer_response or 'Pending review'}. "
        f"Observed outcome: {payload.observed_outcome} (Confidence: {int(payload.outcome_confidence * 100)}%). "
        f"Follow-up: {payload.follow_up_actions or 'None noted'}."
    )
    await hindsight_service.retain_interaction(
        customer_id=payload.customer_id,
        content=outcome_summary,
        interaction_type="Strategy Attempt",
        category="Strategy_Outcome",
        tags=["strategy_outcome", payload.customer_id, payload.strategy_type.lower().replace(" ", "_")],
        importance="High"
    )

    # Return created record
    async with get_db() as db:
        row = await (await db.execute("SELECT * FROM strategies WHERE id = ?", (strat_id,))).fetchone()
        return _row_to_strategy(row)

@router.patch("/{strategy_id}/outcome", response_model=StrategyAttempt)
async def update_strategy_outcome(strategy_id: str, payload: StrategyUpdateOutcome):
    """Update observed customer response, outcome status, and notes after meeting review."""
    now_iso = datetime.utcnow().isoformat()
    async with get_db() as db:
        existing = await (await db.execute("SELECT * FROM strategies WHERE id = ?", (strategy_id,))).fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Strategy record not found")

        cust_id = existing["customer_id"]
        strat_type = existing["strategy_type"]
        new_resp = payload.customer_response if payload.customer_response is not None else existing["customer_response"]
        new_notes = payload.salesperson_notes if payload.salesperson_notes is not None else existing["salesperson_notes"]
        new_action = payload.follow_up_actions if payload.follow_up_actions is not None else existing["follow_up_actions"]

        await db.execute(
            """
            UPDATE strategies SET
                customer_response = ?,
                observed_outcome = ?,
                outcome_confidence = ?,
                salesperson_notes = ?,
                follow_up_actions = ?,
                updated_at = ?
            WHERE id = ?
            """,
            (
                new_resp, payload.observed_outcome, payload.outcome_confidence or existing["outcome_confidence"],
                new_notes, new_action, now_iso, strategy_id
            )
        )
        await db.commit()

        row = await (await db.execute("SELECT * FROM strategies WHERE id = ?", (strategy_id,))).fetchone()
        strategy_obj = _row_to_strategy(row)

    # Update Hindsight memory with verified outcome
    updated_summary = (
        f"Verified Strategy Outcome [{strat_type}]: Observed outcome updated to {payload.observed_outcome}. "
        f"Response: {new_resp or 'N/A'}. Action: {new_action or 'N/A'}."
    )
    await hindsight_service.retain_interaction(
        customer_id=cust_id,
        content=updated_summary,
        interaction_type="Outcome Verification",
        category="Strategy_Outcome",
        tags=["strategy_outcome", cust_id, strat_type.lower().replace(" ", "_")],
        importance="High"
    )

    return strategy_obj

@router.get("/summary/{customer_id}")
async def get_strategy_dna_summary(customer_id: str):
    """Returns aggregated strategy statistics and win rates for an account."""
    async with get_db() as db:
        rows = await (await db.execute(
            "SELECT * FROM strategies WHERE customer_id = ?",
            (customer_id,)
        )).fetchall()

        total = len(rows)
        successful = sum(1 for r in rows if r["observed_outcome"] == "SUCCESSFUL")
        unsuccessful = sum(1 for r in rows if r["observed_outcome"] == "UNSUCCESSFUL")
        partially = sum(1 for r in rows if r["observed_outcome"] == "PARTIALLY_SUCCESSFUL")
        inconclusive = sum(1 for r in rows if r["observed_outcome"] == "INCONCLUSIVE")
        not_attempted = sum(1 for r in rows if r["observed_outcome"] == "NOT_ATTEMPTED")

        # Breakdown by strategy type
        type_breakdown: Dict[str, Dict[str, Any]] = {}
        for r in rows:
            stype = r["strategy_type"]
            if stype not in type_breakdown:
                type_breakdown[stype] = {"total": 0, "successful": 0, "unsuccessful": 0, "outcomes": []}
            type_breakdown[stype]["total"] += 1
            if r["observed_outcome"] == "SUCCESSFUL":
                type_breakdown[stype]["successful"] += 1
            elif r["observed_outcome"] == "UNSUCCESSFUL":
                type_breakdown[stype]["unsuccessful"] += 1
            type_breakdown[stype]["outcomes"].append(r["observed_outcome"])

        top_successful = [
            {"type": st, "description": r["strategy_description"], "response": r["customer_response"]}
            for r in rows if r["observed_outcome"] == "SUCCESSFUL"
        ]

        failed_approaches = [
            {"type": st, "description": r["strategy_description"], "response": r["customer_response"], "lesson": r["follow_up_actions"]}
            for r in rows if r["observed_outcome"] == "UNSUCCESSFUL"
        ]

        return {
            "customer_id": customer_id,
            "total_strategies": total,
            "successful_count": successful,
            "unsuccessful_count": unsuccessful,
            "partially_successful_count": partially,
            "inconclusive_count": inconclusive,
            "not_attempted_count": not_attempted,
            "win_rate_percentage": round((successful / total * 100), 1) if total > 0 else 0,
            "by_type": type_breakdown,
            "top_successful_strategies": top_successful,
            "failed_approaches": failed_approaches
        }

# ==========================================
# Strategy Experiment Tracker Endpoints
# ==========================================

def _row_to_experiment(r) -> StrategyExperiment:
    return StrategyExperiment(
        id=r["id"],
        customer_id=r["customer_id"],
        briefing_id=r["briefing_id"],
        recommended_strategy=r["recommended_strategy"],
        recommendation_date=r["recommendation_date"],
        attempted=bool(r["attempted"]),
        attempt_date=r["attempt_date"],
        stakeholder_name=r["stakeholder_name"],
        customer_response=r["customer_response"],
        observed_outcome=r["observed_outcome"],
        salesperson_notes=r["salesperson_notes"],
        next_action=r["next_action"],
        created_at=r["created_at"]
    )

@router.get("/experiments/{customer_id}", response_model=List[StrategyExperiment])
async def list_customer_experiments(customer_id: str):
    """Retrieve all recommendation-to-outcome experiments tracked for an account."""
    async with get_db() as db:
        rows = await (await db.execute(
            "SELECT * FROM strategy_experiments WHERE customer_id = ? ORDER BY recommendation_date DESC, created_at DESC",
            (customer_id,)
        )).fetchall()
        return [_row_to_experiment(r) for r in rows]

@router.post("/experiments", response_model=StrategyExperiment)
async def create_strategy_experiment(payload: Dict[str, Any]):
    """Creates a tracked experiment from an AI recommended strategy."""
    exp_id = f"exp-{uuid.uuid4().hex[:8]}"
    now_date = payload.get("recommendation_date") or dt_date.today().isoformat()
    now_iso = datetime.utcnow().isoformat()

    async with get_db() as db:
        await db.execute(
            """
            INSERT INTO strategy_experiments (
                id, customer_id, briefing_id, recommended_strategy, recommendation_date,
                attempted, attempt_date, stakeholder_name, customer_response,
                observed_outcome, salesperson_notes, next_action, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                exp_id, payload["customer_id"], payload.get("briefing_id"),
                payload["recommended_strategy"], now_date,
                1 if payload.get("attempted") else 0, payload.get("attempt_date"),
                payload.get("stakeholder_name"), payload.get("customer_response"),
                payload.get("observed_outcome", "NOT_ATTEMPTED"),
                payload.get("salesperson_notes"), payload.get("next_action"),
                now_iso
            )
        )
        await db.commit()

        row = await (await db.execute("SELECT * FROM strategy_experiments WHERE id = ?", (exp_id,))).fetchone()
        return _row_to_experiment(row)

@router.patch("/experiments/{experiment_id}", response_model=StrategyExperiment)
async def update_strategy_experiment(experiment_id: str, payload: StrategyExperimentUpdate):
    """Logs the real-world attempt and customer response for an AI recommendation."""
    async with get_db() as db:
        existing = await (await db.execute("SELECT * FROM strategy_experiments WHERE id = ?", (experiment_id,))).fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Strategy experiment not found")

        cust_id = existing["customer_id"]
        rec_strat = existing["recommended_strategy"]
        attempt_date = payload.attempt_date or dt_date.today().isoformat()

        await db.execute(
            """
            UPDATE strategy_experiments SET
                attempted = ?,
                attempt_date = ?,
                stakeholder_name = ?,
                customer_response = ?,
                observed_outcome = ?,
                salesperson_notes = ?,
                next_action = ?
            WHERE id = ?
            """,
            (
                1 if payload.attempted else 0, attempt_date,
                payload.stakeholder_name, payload.customer_response,
                payload.observed_outcome, payload.salesperson_notes,
                payload.next_action, experiment_id
            )
        )
        await db.commit()

        row = await (await db.execute("SELECT * FROM strategy_experiments WHERE id = ?", (experiment_id,))).fetchone()
        exp_obj = _row_to_experiment(row)

    # Retain the verified feedback into Hindsight
    if payload.attempted:
        memory_content = (
            f"Strategy Experiment Outcome: Recommended strategy '{rec_strat[:80]}...' attempted with {payload.stakeholder_name or 'customer'}. "
            f"Response: {payload.customer_response or 'N/A'}. "
            f"Observed outcome: {payload.observed_outcome}. Action: {payload.next_action or 'N/A'}."
        )
        await hindsight_service.retain_interaction(
            customer_id=cust_id,
            content=memory_content,
            interaction_type="Strategy Experiment",
            category="Strategy_Outcome",
            tags=["strategy_experiment", cust_id, payload.observed_outcome.lower()],
            importance="High"
        )

    return exp_obj
