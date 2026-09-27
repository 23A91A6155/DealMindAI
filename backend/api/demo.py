import logging
from typing import List, Dict, Any
from fastapi import APIRouter
from backend.services.demo_service import demo_service
from backend.models.schemas import DemoStep, BeforeVsAfter

router = APIRouter(prefix="/api/demo", tags=["Demo Mode"])
logger = logging.getLogger(__name__)

@router.get("/before-after", response_model=BeforeVsAfter)
async def get_before_vs_after():
    """Retrieve visual side-by-side comparison of Generic AI vs DealMind with Hindsight."""
    return demo_service.get_before_vs_after()

@router.post("/run", response_model=List[DemoStep])
async def run_learning_demo():
    """
    Executes the 5-step Learning Curve Demo sequence.
    Demonstrates agent progression from generic responses to memory-grounded intelligence.
    """
    results = await demo_service.run_full_demo_sequence()
    return results

@router.post("/reset")
async def reset_demo():
    """Resets demo memory state back to baseline."""
    return await demo_service.reset_demo()
