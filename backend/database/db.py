import aiosqlite
import logging
from pathlib import Path
from contextlib import asynccontextmanager
from backend.config import DATABASE_PATH

logger = logging.getLogger(__name__)

@asynccontextmanager
async def get_db():
    """Async context manager providing a SQLite database connection."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        yield db

async def init_db():
    """Initialize SQLite tables for application relational metadata."""
    Path(DATABASE_PATH).parent.mkdir(parents=True, exist_ok=True)
    async with get_db() as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS customers (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                domain TEXT NOT NULL,
                overview TEXT,
                deal_value REAL,
                deal_stage TEXT,
                deal_probability INTEGER,
                snapshot_json TEXT,
                known_preferences_json TEXT,
                known_objections_json TEXT,
                competitors_mentioned_json TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        await db.execute("""
            CREATE TABLE IF NOT EXISTS contacts (
                id TEXT PRIMARY KEY,
                customer_id TEXT NOT NULL,
                name TEXT NOT NULL,
                role TEXT NOT NULL,
                email TEXT,
                priority TEXT,
                FOREIGN KEY (customer_id) REFERENCES customers (id)
            )
        """)
        
        await db.execute("""
            CREATE TABLE IF NOT EXISTS deals (
                id TEXT PRIMARY KEY,
                customer_id TEXT NOT NULL,
                title TEXT NOT NULL,
                value REAL,
                stage TEXT,
                probability INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES customers (id)
            )
        """)
        
        await db.execute("""
            CREATE TABLE IF NOT EXISTS interactions (
                id TEXT PRIMARY KEY,
                customer_id TEXT NOT NULL,
                contact_name TEXT,
                date TEXT,
                interaction_type TEXT,
                notes TEXT,
                outcome TEXT,
                objections_json TEXT,
                competitors_json TEXT,
                next_action TEXT,
                retained_memory TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES customers (id)
            )
        """)

        # Strategy DNA: outcome-aware historical strategy ledger
        await db.execute("""
            CREATE TABLE IF NOT EXISTS strategies (
                id TEXT PRIMARY KEY,
                customer_id TEXT NOT NULL,
                interaction_id TEXT,
                stakeholder_id TEXT,
                stakeholder_name TEXT,
                strategy_type TEXT NOT NULL,
                strategy_description TEXT NOT NULL,
                objection_addressed TEXT,
                supporting_materials TEXT,
                date_attempted TEXT NOT NULL,
                salesperson_notes TEXT,
                customer_response TEXT,
                observed_outcome TEXT NOT NULL,
                outcome_confidence REAL DEFAULT 0.85,
                evidence_references_json TEXT,
                follow_up_actions TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES customers (id)
            )
        """)

        # Stakeholder Graph: detailed stakeholder priority and relationship network
        await db.execute("""
            CREATE TABLE IF NOT EXISTS stakeholder_nodes (
                id TEXT PRIMARY KEY,
                customer_id TEXT NOT NULL,
                name TEXT NOT NULL,
                role TEXT NOT NULL,
                email TEXT,
                influence_level TEXT DEFAULT 'Medium',
                decision_power TEXT DEFAULT 'Influencer',
                priorities_json TEXT,
                objections_json TEXT,
                preferences_json TEXT,
                relationships_json TEXT,
                last_interaction_date TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES customers (id)
            )
        """)

        # Contradiction Checker: conflicting statements tracked over time
        await db.execute("""
            CREATE TABLE IF NOT EXISTS contradictions (
                id TEXT PRIMARY KEY,
                customer_id TEXT NOT NULL,
                topic TEXT NOT NULL,
                earlier_statement TEXT NOT NULL,
                earlier_meeting_date TEXT,
                earlier_interaction_id TEXT,
                latest_statement TEXT NOT NULL,
                latest_meeting_date TEXT,
                latest_interaction_id TEXT,
                supporting_evidence TEXT,
                confidence REAL DEFAULT 0.9,
                status TEXT NOT NULL,
                recommended_action TEXT,
                resolution_notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES customers (id)
            )
        """)

        # Strategy Experiments: feedback loop connecting briefings to real attempts & outcomes
        await db.execute("""
            CREATE TABLE IF NOT EXISTS strategy_experiments (
                id TEXT PRIMARY KEY,
                customer_id TEXT NOT NULL,
                briefing_id TEXT,
                recommended_strategy TEXT NOT NULL,
                recommendation_date TEXT NOT NULL,
                attempted BOOLEAN DEFAULT 0,
                attempt_date TEXT,
                stakeholder_name TEXT,
                customer_response TEXT,
                observed_outcome TEXT DEFAULT 'NOT_ATTEMPTED',
                salesperson_notes TEXT,
                next_action TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES customers (id)
            )
        """)
        
        await db.commit()
        logger.info("SQLite database tables initialized successfully.")
