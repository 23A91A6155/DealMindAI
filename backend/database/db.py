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
        
        await db.commit()
        logger.info("SQLite database tables initialized successfully.")
