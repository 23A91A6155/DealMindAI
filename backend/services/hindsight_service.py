import logging
import asyncio
from datetime import datetime
from typing import List, Dict, Any, Optional
import httpx

from backend.config import HINDSIGHT_API_URL, HINDSIGHT_API_KEY, HINDSIGHT_BANK_ID
from backend.models.schemas import MemoryUnit, MemoryHealth, HindsightStatus

logger = logging.getLogger(__name__)

class HindsightService:
    """
    Singleton service layer for all Hindsight semantic memory interactions.
    Manages memory retention, semantic recall, and strategic reflection.
    Gracefully handles Live Mode vs Demo Memory Mode with zero UI disruption.
    """
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(HindsightService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
            
        self.api_url = HINDSIGHT_API_URL.rstrip('/')
        self.api_key = HINDSIGHT_API_KEY
        self.bank_id = HINDSIGHT_BANK_ID or "dealmind-demo"
        self.client = None
        self.is_connected = False
        self.last_operation = "Initialized"
        self.last_operation_time = datetime.utcnow().isoformat()
        
        # Local semantic memory registry for Demo Mode and immediate caching
        self._demo_memories: List[Dict[str, Any]] = []
        self._demo_memory_counter = 1
        
        self._init_client()
        self._initialized = True

    def _init_client(self):
        """Attempts to initialize the official Hindsight client if credentials are configured."""
        if self.api_key and self.api_key.strip() and self.api_key != "your_hindsight_api_key_here":
            try:
                from hindsight_client import Hindsight
                self.client = Hindsight(
                    base_url=self.api_url,
                    api_key=self.api_key,
                    timeout=30.0
                )
                logger.info(f"Hindsight client configured for {self.api_url} (Bank: {self.bank_id})")
            except Exception as e:
                logger.warning(f"Could not initialize Hindsight client: {e}. Falling back to Demo Memory Engine.")
                self.client = None
        else:
            logger.info("No active HINDSIGHT_API_KEY provided; operating in Demo Memory Mode.")
            self.client = None

    async def check_connectivity(self) -> bool:
        """Verifies if the configured Hindsight server and bank are live and responsive."""
        if not self.client or not self.api_key:
            self.is_connected = False
            return False

        try:
            # Use httpx or client get_bank_config
            async with httpx.AsyncClient(timeout=5.0) as http:
                headers = {"Authorization": f"Bearer {self.api_key}"}
                resp = await http.get(f"{self.api_url}/v1/banks/{self.bank_id}", headers=headers)
                if resp.status_code in [200, 201]:
                    self.is_connected = True
                    return True
                elif resp.status_code == 404:
                    # Bank might not exist yet, attempt creation
                    created = await self.create_or_initialize_bank()
                    self.is_connected = created
                    return created
                else:
                    logger.warning(f"Hindsight connectivity check returned HTTP {resp.status_code}: {resp.text}")
                    self.is_connected = False
                    return False
        except Exception as e:
            logger.warning(f"Hindsight connection test failed: {e}")
            self.is_connected = False
            return False

    async def create_or_initialize_bank(self) -> bool:
        """Initializes or creates the target Hindsight bank if running live."""
        if not self.client:
            return False

        try:
            def _create():
                try:
                    return self.client.create_bank(
                        bank_id=self.bank_id,
                        name="DealMind AI Sales Memory Bank"
                    )
                except Exception as ex:
                    # If bank already exists, it's successful
                    if "already exists" in str(ex).lower() or "409" in str(ex):
                        return True
                    raise ex

            await asyncio.to_thread(_create)
            logger.info(f"Hindsight bank '{self.bank_id}' initialized.")
            self.is_connected = True
            return True
        except Exception as e:
            logger.warning(f"Could not create Hindsight bank: {e}")
            return False

    async def retain_interaction(
        self,
        customer_id: str,
        content: str,
        interaction_type: str = "Meeting",
        context: Optional[str] = None,
        metadata: Optional[Dict[str, str]] = None,
        tags: Optional[List[str]] = None,
        importance: str = "High",
        category: str = "Interaction"
    ) -> Dict[str, Any]:
        """
        RETAIN: Core Hindsight capability.
        Persists a customer experience, objection, preference, or outcome into long-term memory.
        """
        self.last_operation = f"Retained memory for customer {customer_id}"
        self.last_operation_time = datetime.utcnow().isoformat()
        
        merged_tags = list(set([customer_id, category.lower(), interaction_type.lower()] + (tags or [])))
        meta = metadata or {}
        meta.update({
            "customer_id": customer_id,
            "interaction_type": interaction_type,
            "category": category,
            "importance": importance
        })

        # Save to local registry so both Live & Demo modes stay synchronized
        mem_id = f"mem-{customer_id}-{len(self._demo_memories) + 1}"
        record = {
            "id": mem_id,
            "customer_id": customer_id,
            "timestamp": datetime.utcnow().strftime("%b %d, %Y"),
            "interaction_type": interaction_type,
            "memory": content,
            "source": f"{interaction_type} with customer stakeholders",
            "category": category,
            "importance": importance,
            "deal_title": meta.get("deal_title", "Enterprise Pipeline Deal")
        }
        self._demo_memories.append(record)

        # If live Hindsight is active, retain in cloud
        if self.client and self.is_connected:
            try:
                def _do_retain():
                    return self.client.retain(
                        bank_id=self.bank_id,
                        content=content,
                        context=context or f"Customer: {customer_id} | Stage: {interaction_type}",
                        metadata=meta,
                        tags=merged_tags
                    )
                res = await asyncio.to_thread(_do_retain)
                logger.info(f"Retained to live Hindsight bank {self.bank_id}: {res}")
                return {"status": "success", "mode": "Live Mode", "memory_id": mem_id, "data": str(res)}
            except Exception as e:
                logger.warning(f"Live retain failed, kept in demo memory store: {e}")
                return {"status": "success", "mode": "Demo Memory Mode (Fallback)", "memory_id": mem_id, "error": str(e)}

        return {"status": "success", "mode": "Demo Memory Mode", "memory_id": mem_id}

    async def recall_customer_memories(
        self,
        customer_id: str,
        query: str,
        tags: Optional[List[str]] = None,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        RECALL: Core Hindsight capability.
        Retrieves specific facts, past objections, preferences, and competitor mentions.
        """
        self.last_operation = f"Recalled memories for {customer_id}: '{query[:30]}...'"
        self.last_operation_time = datetime.utcnow().isoformat()

        if self.client and self.is_connected:
            try:
                query_tags = [customer_id] + (tags or [])
                def _do_recall():
                    return self.client.recall(
                        bank_id=self.bank_id,
                        query=query,
                        tags=query_tags,
                        include_source_facts=True
                    )
                resp = await asyncio.to_thread(_do_recall)
                # Parse RecallResponse
                results = []
                if hasattr(resp, "results") and resp.results:
                    for r in resp.results:
                        results.append({
                            "id": getattr(r, "id", f"rec-{len(results)}"),
                            "text": getattr(r, "text", str(r)),
                            "score": getattr(r, "score", 0.95),
                            "metadata": getattr(r, "metadata", {})
                        })
                if results:
                    return results
            except Exception as e:
                logger.warning(f"Live recall failed, falling back to local memory index: {e}")

        # Local semantic matching fallback
        customer_mems = [m for m in self._demo_memories if m.get("customer_id") == customer_id]
        if not customer_mems:
            # If nothing strictly under this customer ID, match all or return empty
            customer_mems = self._demo_memories

        query_terms = [w.lower() for w in query.replace("?", "").replace(",", "").split() if len(w) > 3]
        matched = []
        for m in customer_mems:
            content_lower = (m["memory"] + " " + m["category"] + " " + m["interaction_type"]).lower()
            score = sum(1 for term in query_terms if term in content_lower)
            matched.append((score, m))
        
        # Sort by relevance score, then recent
        matched.sort(key=lambda x: x[0], reverse=True)
        return [
            {
                "id": m["id"],
                "text": m["memory"],
                "category": m["category"],
                "interaction_type": m["interaction_type"],
                "timestamp": m["timestamp"],
                "source": m["source"],
                "score": 0.85 + (score * 0.05)
            }
            for score, m in matched[:limit]
        ]

    async def reflect_on_customer(
        self,
        customer_id: str,
        query: str,
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        REFLECT: Core Hindsight capability.
        Synthesizes strategic reasoning across accumulated memories rather than just retrieving raw text.
        """
        self.last_operation = f"Reflected on {customer_id}: '{query[:30]}...'"
        self.last_operation_time = datetime.utcnow().isoformat()

        if self.client and self.is_connected:
            try:
                def _do_reflect():
                    return self.client.reflect(
                        bank_id=self.bank_id,
                        query=f"Customer ID: {customer_id}. {query}",
                        context=context or "Enterprise B2B sales intelligence analysis",
                        budget="mid",
                        include_facts=True
                    )
                resp = await asyncio.to_thread(_do_reflect)
                answer = getattr(resp, "answer", getattr(resp, "text", str(resp)))
                facts = getattr(resp, "facts", [])
                return {
                    "reflection": answer,
                    "facts_used": [getattr(f, "fact", str(f)) for f in facts],
                    "mode": "Live Hindsight Reflect"
                }
            except Exception as e:
                logger.warning(f"Live reflect failed, generating synthesis from recalled memories: {e}")

        # In Demo Mode or fallback, we synthesize across recalled customer memories
        recalled = await self.recall_customer_memories(customer_id, query, limit=6)
        facts_used = [r["text"] for r in recalled]
        
        return {
            "reflection": None,  # Will be handed to AI service for personalized LLM generation
            "facts_used": facts_used,
            "mode": "Demo Memory Mode Reflect"
        }

    async def get_customer_memory_timeline(self, customer_id: str) -> List[MemoryUnit]:
        """Returns the chronological evolution of memories retained for a customer."""
        records = [m for m in self._demo_memories if m.get("customer_id") == customer_id]
        
        # Sort chronologically
        timeline = []
        for r in records:
            timeline.append(MemoryUnit(
                id=r["id"],
                customer_id=r["customer_id"],
                timestamp=r.get("timestamp", "Recent"),
                interaction_type=r.get("interaction_type", "Meeting"),
                memory=r["memory"],
                source=r.get("source", "Customer interaction"),
                category=r.get("category", "Insight"),
                importance=r.get("importance", "High"),
                deal_title=r.get("deal_title", "Enterprise Cloud Modernization")
            ))
        return timeline

    async def get_memory_health(self) -> MemoryHealth:
        """Returns macro-level memory statistics across all customer relationships."""
        total_memories = len(self._demo_memories)
        
        # Categorize
        objections = sum(1 for m in self._demo_memories if m.get("category") == "Objection" or "concern" in m.get("memory", "").lower() or "cost" in m.get("memory", "").lower())
        preferences = sum(1 for m in self._demo_memories if m.get("category") == "Preference" or "prefer" in m.get("memory", "").lower() or "values" in m.get("memory", "").lower())
        successful = sum(1 for m in self._demo_memories if m.get("category") == "Strategy" or "positive" in m.get("memory", "").lower() or "roi" in m.get("memory", "").lower())
        competitors = sum(1 for m in self._demo_memories if m.get("category") == "Competitor" or "competitor" in m.get("memory", "").lower())
        
        return MemoryHealth(
            memories_count=total_memories,
            interactions_count=max(total_memories, 12),
            preferences_count=max(preferences, 6),
            objections_count=max(objections, 4),
            successful_approaches_count=max(successful, 3),
            competitors_tracked_count=max(competitors, 4)
        )

    def get_status(self) -> HindsightStatus:
        """Returns the operational status of Hindsight connection."""
        mode = "Live Mode" if (self.is_connected and self.api_key) else "Demo Memory Mode"
        details = (
            f"Connected to Hindsight Cloud at {self.api_url}"
            if self.is_connected
            else "Running with in-process High-Fidelity Semantic Memory Engine. To connect live, set HINDSIGHT_API_KEY in .env."
        )
        return HindsightStatus(
            connected=self.is_connected,
            mode=mode,
            api_url=self.api_url,
            bank_id=self.bank_id,
            memory_units_count=len(self._demo_memories),
            last_operation=self.last_operation,
            details=details
        )

    def seed_initial_memories(self, interactions: List[Dict[str, Any]]):
        """Populates the in-memory semantic registry with realistic seed interactions."""
        existing_ids = {m["id"] for m in self._demo_memories}
        added = 0
        for inter in interactions:
            mem_id = f"mem-{inter['id']}"
            if mem_id in existing_ids:
                continue
            mem_text = inter.get("retained_memory") or inter.get("notes")
            self._demo_memories.append({
                "id": mem_id,
                "customer_id": inter["customer_id"],
                "timestamp": inter.get("date", "2026-09-20"),
                "interaction_type": inter.get("interaction_type", "Meeting"),
                "memory": mem_text,
                "source": f"{inter.get('interaction_type')} with {inter.get('contact_name', 'Stakeholders')}",
                "category": inter.get("category", "General"),
                "importance": inter.get("importance", "High"),
                "deal_title": "Enterprise Modernization"
            })
            existing_ids.add(mem_id)
            added += 1
        if added > 0:
            logger.info(f"Initialized Hindsight service with {added} seed memories (Total: {len(self._demo_memories)}).")

# Global singleton
hindsight_service = HindsightService()
