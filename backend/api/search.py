import logging
import json
from typing import List, Dict, Any
from fastapi import APIRouter, Query
from backend.database.db import get_db
from backend.services.hindsight_service import hindsight_service

router = APIRouter(prefix="/api/search", tags=["Global Search"])
logger = logging.getLogger(__name__)

@router.get("")
async def global_search(q: str = Query(..., min_length=2)):
    """
    Unified global search across:
    1. Customers
    2. Active Deals
    3. Stored Interactions
    4. Hindsight Recalled Memories
    """
    query_term = f"%{q.strip()}%"
    
    customers_matched = []
    deals_matched = []
    interactions_matched = []
    
    async with get_db() as db:
        # Search customers
        c_rows = await (await db.execute(
            "SELECT id, name, domain, deal_value, deal_stage FROM customers WHERE name LIKE ? OR overview LIKE ?",
            (query_term, query_term)
        )).fetchall()
        for r in c_rows:
            customers_matched.append({
                "id": r["id"],
                "type": "customer",
                "title": r["name"],
                "subtitle": f"${r['deal_value']:,.0f} • {r['deal_stage']}",
                "link": f"/customers/{r['id']}"
            })
            
        # Search deals
        d_rows = await (await db.execute(
            "SELECT d.id, d.title, d.value, d.stage, c.name as customer_name, c.id as customer_id FROM deals d JOIN customers c ON d.customer_id = c.id WHERE d.title LIKE ?",
            (query_term,)
        )).fetchall()
        for r in d_rows:
            deals_matched.append({
                "id": r["id"],
                "type": "deal",
                "title": r["title"],
                "subtitle": f"{r['customer_name']} • ${r['value']:,.0f} ({r['stage']})",
                "link": f"/customers/{r['customer_id']}"
            })
            
        # Search interactions
        i_rows = await (await db.execute(
            "SELECT i.id, i.customer_id, i.interaction_type, i.notes, c.name as customer_name FROM interactions i JOIN customers c ON i.customer_id = c.id WHERE i.notes LIKE ? OR i.retained_memory LIKE ?",
            (query_term, query_term)
        )).fetchall()
        for r in i_rows:
            interactions_matched.append({
                "id": r["id"],
                "type": "interaction",
                "title": f"{r['interaction_type']} - {r['customer_name']}",
                "subtitle": r["notes"][:100] + "...",
                "link": f"/customers/{r['customer_id']}"
            })

    # Search Hindsight semantic memories via recall
    hindsight_memories = await hindsight_service.recall_customer_memories(
        customer_id="global",
        query=q,
        limit=5
    )
    memories_matched = [
        {
            "id": m["id"],
            "type": "memory",
            "title": f"Memory: {m['category']}",
            "subtitle": m["text"],
            "link": "/timeline"
        }
        for m in hindsight_memories
    ]
    
    return {
        "query": q,
        "customers": customers_matched,
        "deals": deals_matched,
        "interactions": interactions_matched,
        "memories": memories_matched,
        "total_results": len(customers_matched) + len(deals_matched) + len(interactions_matched) + len(memories_matched)
    }
