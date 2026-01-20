"""
Database connection management
"""

import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2 import pool
from contextlib import contextmanager
from typing import Generator, Optional
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# Connection pool (initialized on first use)
_connection_pool: Optional[pool.ThreadedConnectionPool] = None


def init_connection_pool():
    """Initialize database connection pool"""
    global _connection_pool
    
    if _connection_pool is not None:
        return
    
    try:
        _connection_pool = pool.ThreadedConnectionPool(
            minconn=1,
            maxconn=10,
            host=settings.db_host,
            port=settings.db_port,
            database=settings.db_name,
            user=settings.db_user,
            password=settings.db_password,
            sslmode='require' if settings.db_ssl else 'prefer'
        )
        logger.info("Database connection pool initialized")
    except Exception as e:
        logger.error(f"Failed to initialize database connection pool: {e}")
        raise


def close_connection_pool():
    """Close database connection pool"""
    global _connection_pool
    
    if _connection_pool is not None:
        _connection_pool.closeall()
        _connection_pool = None
        logger.info("Database connection pool closed")


@contextmanager
def get_db_connection() -> Generator[psycopg2.extensions.connection, None, None]:
    """
    Get database connection from pool (context manager)
    
    Usage:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM incidents")
                results = cur.fetchall()
    """
    global _connection_pool
    
    if _connection_pool is None:
        init_connection_pool()
    
    conn = _connection_pool.getconn()
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        logger.error(f"Database error: {e}")
        raise
    finally:
        _connection_pool.putconn(conn)


def test_connection() -> bool:
    """Test database connection"""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
                cur.fetchone()
        logger.info("Database connection test successful")
        return True
    except Exception as e:
        logger.error(f"Database connection test failed: {e}")
        return False



