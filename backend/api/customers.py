import json
import logging
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from backend.database.db import get_db
from backend.models.schemas import (
    Customer, CustomerCreate, Interaction, InteractionCreate,
    DealBriefing, ChatRequest, ChatResponse, MemoryUnit
)
from backend.services.hindsight_service import hindsight_service
from backend.services.ai_service import ai_service

router = APIRouter(prefix="/api/customers", tags=["Customers"])
logger = logging.getLogger(__name__)

def _row_to_customer(row, contacts, deals) -> Customer:
    return Customer(
        id=row["id"],
        name=row["name"],
        domain=row["domain"],
        overview=row["overview"],
        deal_value=row["deal_value"],
        deal_stage=row["deal_stage"],
        deal_probability=row["deal_probability"],
        snapshot=json.loads(row["snapshot_json"]) if row["snapshot_json"] else {},
        known_preferences=json.loads(row["known_preferences_json"]) if row["known_preferences_json"] else [],
        known_objections=json.loads(row["known_objections_json"]) if row["known_objections_json"] else [],
        competitors_mentioned=json.loads(row["competitors_mentioned_json"]) if row["competitors_mentioned_json"] else [],
        contacts=contacts,
        created_at=row["created_at"]
    )

@router.get("", response_model=List[Customer])
async def list_customers():
    """List all enterprise customers with pipeline metadata."""
    async with get_db() as db:
        c_rows = await (await db.execute("SELECT * FROM customers ORDER BY deal_value DESC")).fetchall()
        
        customers = []
        for c in c_rows:
            cnt_rows = await (await db.execute("SELECT * FROM contacts WHERE customer_id = ?", (c["id"],))).fetchall()
            deal_rows = await (await db.execute("SELECT * FROM deals WHERE customer_id = ?", (c["id"],))).fetchall()
            
            contacts = [{"id": r["id"], "name": r["name"], "role": r["role"], "email": r["email"], "priority": r["priority"]} for r in cnt_rows]
            customers.append(_row_to_customer(c, contacts, deal_rows))
            
        return customers

@router.get("/{customer_id}", response_model=Customer)
async def get_customer(customer_id: str):
    """Retrieve detailed customer profile, snapshot, contacts, and deal stage."""
    async with get_db() as db:
        c_row = await (await db.execute("SELECT * FROM customers WHERE id = ?", (customer_id,))).fetchone()
        if not c_row:
            raise HTTPException(status_code=404, detail="Customer not found")
            
        cnt_rows = await (await db.execute("SELECT * FROM contacts WHERE customer_id = ?", (customer_id,))).fetchall()
        deal_rows = await (await db.execute("SELECT * FROM deals WHERE customer_id = ?", (customer_id,))).fetchall()
        
        contacts = [{"id": r["id"], "name": r["name"], "role": r["role"], "email": r["email"], "priority": r["priority"]} for r in cnt_rows]
        return _row_to_customer(c_row, contacts, deal_rows)

@router.post("", response_model=Customer)
async def create_customer(payload: CustomerCreate):
    """Register a new customer account."""
    import uuid
    cust_id = f"cust-{uuid.uuid4().hex[:8]}"
    snapshot_dict = {
        "industry": payload.industry,
        "company_size": payload.company_size,
        "current_solution": payload.current_solution,
        "main_pain_points": [],
        "decision_makers": [],
        "budget_range": payload.budget_range,
        "buying_timeline": payload.buying_timeline
    }
    
    async with get_db() as db:
        await db.execute(
            """
            INSERT INTO customers (
                id, name, domain, overview, deal_value, deal_stage, deal_probability,
                snapshot_json, known_preferences_json, known_objections_json, competitors_mentioned_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                cust_id, payload.name, payload.domain, payload.overview, payload.deal_value,
                payload.deal_stage, payload.deal_probability, json.dumps(snapshot_dict),
                json.dumps([]), json.dumps([]), json.dumps([])
            )
        )
        await db.commit()
    return await get_customer(cust_id)

@router.get("/{customer_id}/interactions", response_model=List[Interaction])
async def list_interactions(customer_id: str):
    """List historical customer touchpoints and meetings."""
    async with get_db() as db:
        rows = await (await db.execute(
            "SELECT * FROM interactions WHERE customer_id = ? ORDER BY date DESC, created_at DESC",
            (customer_id,)
        )).fetchall()
        
        results = []
        for r in rows:
            results.append(Interaction(
                id=r["id"],
                customer_id=r["customer_id"],
                contact_name=r["contact_name"],
                date=r["date"],
                interaction_type=r["interaction_type"],
                notes=r["notes"],
                outcome=r["outcome"],
                objections=json.loads(r["objections_json"]) if r["objections_json"] else [],
                competitors=json.loads(r["competitors_json"]) if r["competitors_json"] else [],
                next_action=r["next_action"],
                retained_memory=r["retained_memory"],
                created_at=r["created_at"]
            ))
        return results

@router.post("/{customer_id}/interactions", response_model=Interaction)
async def add_interaction(customer_id: str, payload: InteractionCreate):
    """
    Save & Learn:
    1. Saves structured interaction to SQLite.
    2. Synthesizes memory proposition.
    3. Retains memory into Hindsight via hindsight_service.retain_interaction().
    4. Updates customer preferences, objections, and competitors.
    """
    import uuid
    from datetime import date as dt_date
    inter_id = f"int-{uuid.uuid4().hex[:8]}"
    interaction_date = payload.date or dt_date.today().isoformat()
    
    # Meaningful semantic memory synthesis
    memory_parts = []
    if payload.notes:
        memory_parts.append(payload.notes.strip())
    if payload.objections:
        memory_parts.append(f"Objections raised: {', '.join(payload.objections)}.")
    if payload.competitors:
        memory_parts.append(f"Competitors mentioned: {', '.join(payload.competitors)}.")
    if payload.outcome:
        memory_parts.append(f"Outcome: {payload.outcome}.")
    
    retained_text = " ".join(memory_parts)
    
    # 1. Retain into Hindsight
    category = "Objection" if payload.objections else ("Competitor" if payload.competitors else "Preference")
    await hindsight_service.retain_interaction(
        customer_id=customer_id,
        content=retained_text,
        interaction_type=payload.interaction_type,
        category=category,
        tags=payload.competitors + payload.objections
    )
    
    # 2. Persist to SQLite
    async with get_db() as db:
        await db.execute(
            """
            INSERT INTO interactions (
                id, customer_id, contact_name, date, interaction_type, notes,
                outcome, objections_json, competitors_json, next_action, retained_memory
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                inter_id, customer_id, payload.contact_name, interaction_date,
                payload.interaction_type, payload.notes, payload.outcome,
                json.dumps(payload.objections), json.dumps(payload.competitors),
                payload.next_action, retained_text
            )
        )
        
        # Update customer snapshot lists if new items present
        c_row = await (await db.execute("SELECT * FROM customers WHERE id = ?", (customer_id,))).fetchone()
        if c_row:
            cur_objs = json.loads(c_row["known_objections_json"]) if c_row["known_objections_json"] else []
            cur_comps = json.loads(c_row["competitors_mentioned_json"]) if c_row["competitors_mentioned_json"] else []
            
            for obj in payload.objections:
                if obj and obj not in cur_objs:
                    cur_objs.append(obj)
            for comp in payload.competitors:
                if comp and comp not in cur_comps:
                    cur_comps.append(comp)
                    
            await db.execute(
                "UPDATE customers SET known_objections_json = ?, competitors_mentioned_json = ? WHERE id = ?",
                (json.dumps(cur_objs), json.dumps(cur_comps), customer_id)
            )
            
        await db.commit()
        
    return Interaction(
        id=inter_id,
        customer_id=customer_id,
        contact_name=payload.contact_name,
        date=interaction_date,
        interaction_type=payload.interaction_type,
        notes=payload.notes,
        outcome=payload.outcome,
        objections=payload.objections,
        competitors=payload.competitors,
        next_action=payload.next_action,
        retained_memory=retained_text,
        created_at=datetime_now_iso()
    )

def datetime_now_iso():
    from datetime import datetime
    return datetime.utcnow().isoformat()

@router.get("/{customer_id}/timeline", response_model=List[MemoryUnit])
async def get_customer_memory_timeline(customer_id: str):
    """Visual chronological memory progression learned by Hindsight."""
    timeline = await hindsight_service.get_customer_memory_timeline(customer_id)
    return timeline

@router.post("/{customer_id}/briefing", response_model=DealBriefing)
async def generate_customer_briefing(customer_id: str):
    """
    Generate 'Prepare Me for My Next Call' Deal Briefing.
    Uses Hindsight recall & reflect to synthesize personalized strategy.
    """
    customer = await get_customer(customer_id)
    briefing = await ai_service.generate_briefing(customer.model_dump())
    return briefing

@router.post("/{customer_id}/chat", response_model=ChatResponse)
async def ask_dealmind_chat(customer_id: str, payload: ChatRequest):
    """
    Ask DealMind conversational assistant.
    Retrieves memories with Hindsight Recall and returns explicit Memory Used badges.
    """
    customer = await get_customer(customer_id)
    history_dicts = [h.model_dump() for h in payload.history] if payload.history else []
    response = await ai_service.answer_dealmind_chat(customer.model_dump(), payload.message, history_dicts)
    return response
