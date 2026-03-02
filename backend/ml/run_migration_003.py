"""
Applies migration 003_moderation.sql (moderation_reason, index on verified).
"""

from pathlib import Path

import psycopg2

from app.config import settings


def main() -> None:
    conn = psycopg2.connect(
        host=settings.db_host,
        port=settings.db_port,
        database=settings.db_name,
        user=settings.db_user,
        password=settings.db_password,
        sslmode="require" if settings.db_ssl else "prefer",
    )
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute(
                    "ALTER TABLE incidents ADD COLUMN IF NOT EXISTS moderation_reason VARCHAR(255) DEFAULT NULL"
                )
                cur.execute(
                    "CREATE INDEX IF NOT EXISTS idx_incidents_verified ON incidents(verified)"
                )
        print("[OK] Migration 003 applied (moderation_reason, idx_incidents_verified)")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
