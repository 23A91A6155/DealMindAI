import json
import uuid
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException

from backend.database.db import get_db
from backend.models.schemas import ContradictionRecord, ContradictionUpdateStatus
from backend.services.hindsight_service import hindsight_service
from backend.services.ai_service import ai_service

router = APIRouter(prefix="/api/contradictions", tags=["Customer Contradiction Checker"])
logger = logging.getLogger(__name__)

def _row_to_contradiction(r) -> ContradictionRecord:
    return ContradictionRecord(
        id=r["id"],
        customer_id=r["customer_id"],
        topic=r["topic"],
        earlier_statement=r["earlier_statement"],
        earlier_meeting_date=r["earlier_meeting_date"],
        earlier_interaction_id=r["earlier_interaction_id"],
        latest_statement=r["latest_statement"],
        latest_meeting_date=r["latest_meeting_date"],
        latest_interaction_id=r["latest_interaction_id"],
        supporting_evidence=r["supporting_evidence"],
        confidence=r["confidence"] or 0.9,
        status=r["status"],
        recommended_action=r["recommended_action"],
        resolution_notes=r["resolution_notes"],
        created_at=r["created_at"],
        updated_at=r["updated_at"]
    )

@router.get("/customer/{customer_id}", response_model=List[ContradictionRecord])
async def list_customer_contradictions(customer_id: str, status: Optional[str] = None):
    """Retrieve all identified contradictory or changing statements across account meetings."""
    async with get_db() as db:
        if status:
            rows = await (await db.execute(
                "SELECT * FROM contradictions WHERE customer_id = ? AND status = ? ORDER BY created_at DESC",
                (customer_id, status)
            )).fetchall()
        else:
            rows = await (await db.execute(
                "SELECT * FROM contradictions WHERE customer_id = ? ORDER BY created_at DESC",
                (customer_id,)
            )).fetchall()
        return [_row_to_contradiction(r) for r in rows]

@router.post("/detect/{customer_id}", response_model=List[ContradictionRecord])
async def run_contradiction_detection(customer_id: str):
    """
    Automated contradiction scan:
    Compares historical statements across meetings to identify shifts in budget, timelines, or requirements.
    """
    async with get_db() as db:
        c_row = await (await db.execute("SELECT * FROM customers WHERE id = ?", (customer_id,))).fetchone()
        if not c_row:
            raise HTTPException(status_code=404, detail="Customer not found")

        inter_rows = await (await db.execute(
            "SELECT * FROM interactions WHERE customer_id = ? ORDER BY date ASC",
            (customer_id,)
        )).fetchall()

    if len(inter_rows) < 2:
        return await list_customer_contradictions(customer_id)

    # Use AI service to detect statement shifts and validate deterministically
    inter_dicts = [dict(r) for r in inter_rows]
    detected_candidates = await ai_service.detect_contradictions(c_row["name"], inter_dicts)

    now_iso = datetime.utcnow().isoformat()
    async with get_db() as db:
        for cand in detected_candidates:
            # Check if identical topic already logged to avoid duplicates
            existing = await (await db.execute(
                "SELECT id FROM contradictions WHERE customer_id = ? AND topic = ?",
                (customer_id, cand["topic"])
            )).fetchone()

            if not existing:
                cid = f"contra-{uuid.uuid4().hex[:8]}"
                await db.execute(
                    """
                    INSERT INTO contradictions (
                        id, customer_id, topic, earlier_statement, earlier_meeting_date,
                        earlier_interaction_id, latest_statement, latest_meeting_date,
                        latest_interaction_id, supporting_evidence, confidence, status,
                        recommended_action, resolution_notes, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        cid, customer_id, cand["topic"], cand["earlier_statement"],
                        cand.get("earlier_date"), cand.get("earlier_id"),
                        cand["latest_statement"], cand.get("latest_date"),
                        cand.get("latest_id"), cand.get("supporting_evidence"),
                        cand.get("confidence", 0.9), "UNREVIEWED",
                        cand.get("recommended_action"), None, now_iso, now_iso
                    )
                )
        await db.commit()

    return await list_customer_contradictions(customer_id)

@router.patch("/{contradiction_id}/status", response_model=ContradictionRecord)
async def update_contradiction_status(contradiction_id: str, payload: ContradictionUpdateStatus):
    """
    Salesperson reviews contradiction: marks as CONFIRMED_CHANGE, NOT_A_CONTRADICTION,
    NEEDS_CLARIFICATION, or RESOLVED.
    Confirmed changes are permanently retained into Hindsight memory.
    """
    now_iso = datetime.utcnow().isoformat()
    async with get_db() as db:
        existing = await (await db.execute(
            "SELECT * FROM contradictions WHERE id = ?",
            (contradiction_id,)
        )).fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Contradiction record not found")

        cust_id = existing["customer_id"]
        topic = existing["topic"]

        await db.execute(
            """
            UPDATE contradictions SET
                status = ?,
                resolution_notes = ?,
                updated_at = ?
            WHERE id = ?
            """,
            (payload.status, payload.resolution_notes, now_iso, contradiction_id)
        )
        await db.commit()

        row = await (await db.execute(
            "SELECT * FROM contradictions WHERE id = ?",
            (contradiction_id,)
        )).fetchone()
        record_obj = _row_to_contradiction(row)

    # If confirmed change or resolved, feed into Hindsight memory bank
    if payload.status in ["CONFIRMED_CHANGE", "RESOLVED"]:
        memory_content = (
            f"Confirmed Account Shift [{topic}]: Latest verified status is '{record_obj.latest_statement}'. "
            f"Supercedes earlier statement from {record_obj.earlier_meeting_date}. Resolution: {payload.resolution_notes or 'Verified by sales team'}."
        )
        await hindsight_service.retain_interaction(
            customer_id=cust_id,
            content=memory_content,
            interaction_type="Contradiction Resolution",
            category="Milestone",
            tags=["contradiction_resolved", cust_id, "shift_confirmed"],
            importance="High"
        )

    return record_obj

@router.get("/summary/{customer_id}")
async def get_contradictions_summary(customer_id: str):
    """Aggregate statistics of customer contradictions."""
    async with get_db() as db:
        rows = await (await db.execute(
            "SELECT * FROM contradictions WHERE customer_id = ?",
            (customer_id,)
        )).fetchall()

    total = len(rows)
    unreviewed = sum(1 for r in rows if r["status"] == "UNREVIEWED")
    confirmed = sum(1 for r in rows if r["status"] == "CONFIRMED_CHANGE")
    needs_clarification = sum(1 for r in rows if r["status"] == "NEEDS_CLARIFICATION")
    resolved = sum(1 for r in rows if r["status"] == "RESOLVED")

    return {
        "customer_id": customer_id,
        "total_contradictions": total,
        "unreviewed_count": unreviewed,
        "confirmed_change_count": confirmed,
        "needs_clarification_count": needs_clarification,
        "resolved_count": resolved,
        "items": [_row_to_contradiction(r) for r in rows]
    }
