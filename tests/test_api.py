import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from backend.main import app
from backend.database.db import init_db
from backend.database.seed_data import seed_database, INITIAL_INTERACTIONS
from backend.services.hindsight_service import hindsight_service

@pytest.fixture(autouse=True)
async def setup_db_and_memories():
    await init_db()
    await seed_database()
    hindsight_service.seed_initial_memories(INITIAL_INTERACTIONS)
    yield

@pytest.mark.asyncio
async def test_root_health():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "DealMind AI Backend" in data["service"]

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "hindsight" in data
        assert "bank_id" in data["hindsight"]

@pytest.mark.asyncio
async def test_list_and_get_customers():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Trigger lifespan startup
        response = await ac.get("/api/customers")
        assert response.status_code == 200
        customers = response.json()
        assert len(customers) >= 5
        
        # Check Acme Corp
        acme = next((c for c in customers if c["id"] == "cust-acme"), None)
        assert acme is not None
        assert acme["name"] == "Acme Corp"
        assert acme["deal_value"] == 180000.0
        assert len(acme["contacts"]) >= 3

        # Detail endpoint
        detail_resp = await ac.get("/api/customers/cust-acme")
        assert detail_resp.status_code == 200
        detail = detail_resp.json()
        assert detail["id"] == "cust-acme"
        assert "snapshot" in detail
        assert "industry" in detail["snapshot"]

@pytest.mark.asyncio
async def test_customer_interactions_and_save_learn():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Check existing interactions
        list_resp = await ac.get("/api/customers/cust-acme/interactions")
        assert list_resp.status_code == 200
        initial_count = len(list_resp.json())
        assert initial_count >= 5

        # Add new interaction (Save & Learn)
        new_inter = {
            "customer_id": "cust-acme",
            "contact_name": "Marcus Vance",
            "date": "2026-09-27",
            "interaction_type": "Executive Call",
            "notes": "Marcus agreed that our disaster recovery architecture meets Board requirements. Requested final SLA terms.",
            "outcome": "Customer moving to final contracting.",
            "objections": [],
            "competitors": [],
            "next_action": "Issue formal SLA contract rider."
        }
        post_resp = await ac.post("/api/customers/cust-acme/interactions", json=new_inter)
        assert post_resp.status_code == 200
        created = post_resp.json()
        assert created["customer_id"] == "cust-acme"
        assert "retained_memory" in created
        assert "disaster recovery" in created["retained_memory"].lower()

@pytest.mark.asyncio
async def test_memory_timeline():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.get("/api/customers/cust-acme/timeline")
        assert resp.status_code == 200
        timeline = resp.json()
        assert len(timeline) >= 4
        assert any("Competitor X" in item["memory"] for item in timeline)

@pytest.mark.asyncio
async def test_ai_deal_briefing():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.post("/api/customers/cust-acme/briefing")
        assert resp.status_code == 200
        briefing = resp.json()
        assert briefing["customer_id"] == "cust-acme"
        assert "what_happened" in briefing
        assert "recommended_strategy" in briefing
        assert len(briefing["suggested_talking_points"]) >= 2
        assert len(briefing["memories_used"]) > 0

@pytest.mark.asyncio
async def test_ask_dealmind_chat():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        query_payload = {
            "message": "What should I focus on in tomorrow's call with Acme Corp?"
        }
        resp = await ac.post("/api/customers/cust-acme/chat", json=query_payload)
        assert resp.status_code == 200
        data = resp.json()
        assert "reply" in data
        assert len(data["memories_used"]) > 0
        assert data["sources_count"] > 0

@pytest.mark.asyncio
async def test_hindsight_direct_memories_api():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Retain
        ret_resp = await ac.post("/api/memories/retain", json={
            "customer_id": "cust-acme",
            "content": "Acme requested quarterly compliance reports.",
            "category": "Preference"
        })
        assert ret_resp.status_code == 200
        
        # Recall
        rec_resp = await ac.post("/api/memories/recall", json={
            "customer_id": "cust-acme",
            "query": "compliance"
        })
        assert rec_resp.status_code == 200
        assert rec_resp.json()["count"] > 0
        
        # Reflect
        ref_resp = await ac.post("/api/memories/reflect", json={
            "customer_id": "cust-acme",
            "query": "What is the strategic compliance posture of Acme Corp?"
        })
        assert ref_resp.status_code == 200

        # Memory health
        health_resp = await ac.get("/api/memories/health")
        assert health_resp.status_code == 200
        assert health_resp.json()["memories_count"] > 5

@pytest.mark.asyncio
async def test_demo_mode_endpoints():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Before vs After
        bva_resp = await ac.get("/api/demo/before-after")
        assert bva_resp.status_code == 200
        bva = bva_resp.json()
        assert "generic_ai" in bva
        assert "dealmind_hindsight" in bva
        assert len(bva["supporting_memories"]) >= 3

        # Run 5-step demo sequence
        run_resp = await ac.post("/api/demo/run")
        assert run_resp.status_code == 200
        steps = run_resp.json()
        assert len(steps) == 5
        assert steps[0]["step_number"] == 1
        assert steps[4]["step_number"] == 5
        assert "Competitor X" in steps[4]["agent_output"]

        # Reset demo
        reset_resp = await ac.post("/api/demo/reset")
        assert reset_resp.status_code == 200

@pytest.mark.asyncio
async def test_insights_and_search():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Insights
        ins_resp = await ac.get("/api/insights")
        assert ins_resp.status_code == 200
        insights = ins_resp.json()
        assert len(insights["repeated_objections"]) >= 2
        assert len(insights["successful_messaging"]) >= 2
        assert len(insights["loop_stages"]) == 5

        # Search
        search_resp = await ac.get("/api/search?q=migration")
        assert search_resp.status_code == 200
        search_data = search_resp.json()
        assert search_data["total_results"] > 0
