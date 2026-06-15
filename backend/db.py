"""Postgres access layer for the sessions table, using a direct connection string."""
from __future__ import annotations

import json
import os

import psycopg2
from psycopg2.extras import Json, RealDictCursor

DATABASE_URL = os.environ["DATABASE_URL"]


def _connect():
    return psycopg2.connect(DATABASE_URL)


def insert_session(session_id: str, scenario: str, started_at: str, transcript: list[dict]) -> None:
    with _connect() as conn, conn.cursor() as cur:
        cur.execute(
            """
            insert into sessions (session_id, scenario, started_at, transcript, turn_count)
            values (%s, %s, %s, %s, 0)
            """,
            (session_id, scenario, started_at, Json(transcript)),
        )
        conn.commit()


def get_session(session_id: str) -> dict | None:
    with _connect() as conn, conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            "select session_id, scenario, started_at, transcript, turn_count from sessions where session_id = %s",
            (session_id,),
        )
        return cur.fetchone()


def update_turn(session_id: str, transcript: list[dict], turn_count: int) -> None:
    with _connect() as conn, conn.cursor() as cur:
        cur.execute(
            "update sessions set transcript = %s, turn_count = %s where session_id = %s",
            (Json(transcript), turn_count, session_id),
        )
        conn.commit()


def finalize_session(session_id: str, ended_at: str, duration_seconds: int) -> None:
    with _connect() as conn, conn.cursor() as cur:
        cur.execute(
            "update sessions set ended_at = %s, duration_seconds = %s where session_id = %s",
            (ended_at, duration_seconds, session_id),
        )
        conn.commit()
