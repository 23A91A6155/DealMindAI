import pytest
from httpx import AsyncClient, ASGITransport
from backend.main import app

@pytest.fixture
def anyio_backend():
    return "asyncio"

@pytest.mark.asyncio
async def test_strategies_dna_endpoints():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Fetch customer strategies
        resp = await client.get("/api/strategies/customer/cust-acme")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) >= 1

        # 2. Get customer strategies summary
        resp_sum = await client.get("/api/strategies/customer/cust-acme/summary")
        assert resp_sum.status_code == 200
        summary = resp_sum.json()
        assert "total_strategies" in summary
        assert "successful" in summary
        assert "unsuccessful" in summary

        # 3. Create a new strategy attempt
        new_strat = {
            "customer_id": "cust-acme",
            "strategy_type": "Pilot proposal",
            "strategy_description": "Propose 30-day proof-of-concept with zero factory downtime SLA",
            "objection_addressed": "Migration downtime fears",
            "observed_outcome": "NOT_ATTEMPTED",
            "salesperson_notes": "Preparing for Q3 review"
        }
        create_resp = await client.post("/api/strategies", json=new_strat)
        assert create_resp.status_code in (200, 201)
        created = create_resp.json()

        strat_id = created["id"]
        assert strat_id.startswith("strat-")

        # 4. Update the strategy outcome
        update_data = {
            "observed_outcome": "SUCCESSFUL",
            "customer_response": "VP of Operations accepted pilot parameters after reviewing SLA",
            "outcome_confidence": 0.95,
            "salesperson_notes": "Pilot kick-off scheduled"
        }
        update_resp = await client.patch(f"/api/strategies/{strat_id}/outcome", json=update_data)
        assert update_resp.status_code == 200
        updated = update_resp.json()
        assert updated["observed_outcome"] == "SUCCESSFUL"
        assert updated["customer_response"] == update_data["customer_response"]

@pytest.mark.asyncio
async def test_stakeholders_and_graph_endpoints():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Fetch stakeholders list
        resp = await client.get("/api/stakeholders/customer/cust-acme")
        assert resp.status_code == 200
        stakeholders = resp.json()
        assert len(stakeholders) >= 2
        assert any(s["name"] == "Marcus Vance" for s in stakeholders)

        # Fetch stakeholder graph data
        graph_resp = await client.get("/api/stakeholders/customer/cust-acme/graph")
        assert graph_resp.status_code == 200
        graph = graph_resp.json()
        assert "account_node" in graph
        assert "nodes" in graph
        assert "edges" in graph
        assert len(graph["nodes"]) >= 2

@pytest.mark.asyncio
async def test_contradictions_endpoints():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Fetch contradictions
        resp = await client.get("/api/contradictions/customer/cust-acme")
        assert resp.status_code == 200
        contradictions = resp.json()
        assert len(contradictions) >= 1
        first_c = contradictions[0]
        c_id = first_c["id"]

        # Update contradiction status
        status_resp = await client.patch(
            f"/api/contradictions/{c_id}/status",
            json={"status": "CONFIRMED_CHANGE", "resolution_notes": "Confirmed with Sarah Lin during 1-on-1"}
        )
        assert status_resp.status_code == 200
        assert status_resp.json()["status"] == "CONFIRMED_CHANGE"

        detect_resp = await client.post("/api/contradictions/detect/cust-acme")
        assert detect_resp.status_code == 200
        detect_result = detect_resp.json()
        assert isinstance(detect_result, list)


@pytest.mark.asyncio
async def test_customer_health_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/api/customers/cust-acme/health")
        assert resp.status_code == 200
        health = resp.json()
        assert health["customer_id"] == "cust-acme"
        assert health["memory_status"] in ["FRESH", "NEEDS_REVIEW", "OUTDATED", "INSUFFICIENT_DATA"]
        assert health["stakeholders_count"] >= 1
        assert health["strategy_outcomes_count"] >= 1

@pytest.mark.asyncio
async def test_evaluation_benchmark_endpoints():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Benchmark comparison
        resp = await client.get("/api/evaluation/benchmark")
        assert resp.status_code == 200
        benchmark = resp.json()
        assert "mode_a_stateless" in benchmark
        assert "mode_b_hindsight" in benchmark
        assert "mode_c_outcome_aware" in benchmark
        assert benchmark["mode_c_outcome_aware"]["relevance_score"] > benchmark["mode_a_stateless"]["relevance_score"]
        assert benchmark["mode_c_outcome_aware"]["strategy_awareness"] > benchmark["mode_b_hindsight"]["strategy_awareness"]

        # Run benchmark
        run_resp = await client.post("/api/evaluation/run?customer_id=cust-acme")
        assert run_resp.status_code == 200
        run_data = run_resp.json()
        assert run_data["status"] == "completed"
        assert "delta" in run_data
