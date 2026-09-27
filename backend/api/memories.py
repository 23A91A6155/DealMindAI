import logging
from typing import List, Optional, Dict, Any
from fastapi import APIRouter
from pydantic import BaseModel
from backend.services.hindsight_service import hindsight_service
from backend.models.schemas import MemoryHealth, HindsightStatus

router = APIRouter(prefix="/api/memories", tags=["Hindsight Memory"])
logger = logging.getLogger(__name__)

class RetainPayload(BaseModel):
    customer_id: str
    content: str
    interaction_type: Optional[str] = "Customer Interaction"
    category: Optional[str] = "General"
    tags: Optional[List[str]] = []
    importance: Optional[str] = "High"

class RecallPayload(BaseModel):
    customer_id: str
    query: str
    tags: Optional[List[str]] = []
    limit: Optional[int] = 10

class ReflectPayload(BaseModel):
    customer_id: str
    query: str
    context: Optional[str] = None

@router.post("/retain")
async def retain_memory(payload: RetainPayload):
    """
    Retains a memory unit into Hindsight.
    Stores episodic customer knowledge, objections, or competitive findings.
    """
    result = await hindsight_service.retain_interaction(
        customer_id=payload.customer_id,
        content=payload.content,
        interaction_type=payload.interaction_type,
        category=payload.category,
        tags=payload.tags,
        importance=payload.importance
    )
    return result

@router.post("/recall")
async def recall_memories(payload: RecallPayload):
    """
    Recalls facts from Hindsight matching semantic query and customer tags.
    """
    results = await hindsight_service.recall_customer_memories(
        customer_id=payload.customer_id,
        query=payload.query,
        tags=payload.tags,
        limit=payload.limit or 10
    )
    return {"results": results, "count": len(results)}

@router.post("/reflect")
async def reflect_memory(payload: ReflectPayload):
    """
    Hindsight Reflection: Synthesizes high-level reasoning across accumulated memories.
    """
    result = await hindsight_service.reflect_on_customer(
        customer_id=payload.customer_id,
        query=payload.query,
        context=payload.context
    )
    return result

@router.get("/health", response_model=MemoryHealth)
async def get_memory_health():
    """Retrieve aggregate statistics on memories, preferences, and objections."""
    return await hindsight_service.get_memory_health()

@router.get("/status", response_model=HindsightStatus)
async def get_hindsight_status():
    """Check Hindsight connection status, API endpoint, Bank ID, and mode."""
    return hindsight_service.get_status()
