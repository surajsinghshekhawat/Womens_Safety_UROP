"""
Applies migration 002_time_of_day_columns.sql to the configured database.

This is a small helper for local dev on Windows where quoting multi-line SQL
in the shell is annoying.
"""

from __future__ import annotations

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
                # Apply schema changes (idempotent).
                cur.execute(
                    "ALTER TABLE incidents ADD COLUMN IF NOT EXISTS timezone_offset_minutes INTEGER"
                )
                cur.execute(
                    "ALTER TABLE incidents ADD COLUMN IF NOT EXISTS incident_local_hour SMALLINT"
                )
                cur.execute(
                    "CREATE INDEX IF NOT EXISTS idx_incidents_local_hour ON incidents(incident_local_hour)"
                )

                # Verify columns exist in the active schema.
                cur.execute("SELECT current_database(), current_schema()")
                db_name, schema_name = cur.fetchone()

                cur.execute(
                    """
                    SELECT column_name
                    FROM information_schema.columns
                    WHERE table_schema = %s
                      AND table_name = 'incidents'
                      AND column_name IN ('timezone_offset_minutes', 'incident_local_hour')
                    ORDER BY column_name
                    """,
                    (schema_name,),
                )
                cols = [r[0] for r in cur.fetchall()]

        print(f"[OK] Migration applied on {db_name}.{schema_name}.incidents")
        print("[OK] Columns present:", ", ".join(cols) if cols else "(none)")
    finally:
        conn.close()


if __name__ == "__main__":
    main()

