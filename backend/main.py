import os
import logging
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from backend.config import BACKEND_HOST, BACKEND_PORT, FRONTEND_URL
from backend.database.db import init_db
from backend.database.seed_data import seed_database, INITIAL_INTERACTIONS
from backend.services.hindsight_service import hindsight_service
from backend.api.customers import router as customers_router
from backend.api.memories import router as memories_router
from backend.api.demo import router as demo_router
from backend.api.insights import router as insights_router
from backend.api.search import router as search_router
from backend.api.strategies import router as strategies_router
from backend.api.stakeholders import router as stakeholders_router
from backend.api.contradictions import router as contradictions_router
from backend.api.evaluation import router as evaluation_router


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("dealmind")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initializing DealMind AI Backend...")
    await init_db()
    await seed_database()
    
    # Populate Hindsight memory registry with realistic initial memories
    hindsight_service.seed_initial_memories(INITIAL_INTERACTIONS)
    
    # Check Hindsight connectivity
    is_live = await hindsight_service.check_connectivity()
    if is_live:
        logger.info(f"Hindsight LIVE connection established on bank: {hindsight_service.bank_id}")
    else:
        logger.info(f"Hindsight running in Demo Memory Mode (Bank: {hindsight_service.bank_id})")

    yield
    # Shutdown
    logger.info("Shutting down DealMind AI Backend...")

app = FastAPI(
    title="DealMind AI — Memory-Powered Sales Intelligence Agent",
    description="Adaptive B2B sales copilot that learns from every customer interaction using Hindsight persistent memory.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration supporting localhost and production frontend domains
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]
if FRONTEND_URL and FRONTEND_URL.strip() != "*":
    for origin in FRONTEND_URL.split(","):
        clean_origin = origin.strip().rstrip("/")
        if clean_origin and clean_origin not in allowed_origins:
            allowed_origins.append(clean_origin)
else:
    allowed_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root production health check required by deployment platforms (Render, Railway, AWS, GCP)
@app.get("/health")
async def root_health():
    """Simple health check endpoint required by deployment platforms."""
    return {"status": "ok", "service": "DealMind AI Backend"}

# Detailed API health check
@app.get("/api/health")
async def health_check():
    """Health check endpoint reporting Hindsight connectivity and memory units."""
    status = hindsight_service.get_status()
    return {
        "status": "healthy",
        "service": "DealMind AI Backend",
        "hindsight": {
            "mode": status.mode,
            "connected": status.connected,
            "bank_id": status.bank_id,
            "memory_units": status.memory_units_count
        }
    }

# Register API Routers
app.include_router(customers_router)
app.include_router(memories_router)
app.include_router(demo_router)
app.include_router(insights_router)
app.include_router(search_router)
app.include_router(strategies_router)
app.include_router(stakeholders_router)
app.include_router(contradictions_router)
app.include_router(evaluation_router)


# Mount frontend/dist for unified full-stack single-service deployment if built
dist_dir = Path(__file__).resolve().parent.parent / "frontend" / "dist"
if dist_dir.exists():
    logger.info(f"Mounting production frontend build from {dist_dir}")
    app.mount("/", StaticFiles(directory=str(dist_dir), html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host=BACKEND_HOST, port=BACKEND_PORT, reload=False)
