import sqlite3
from pathlib import Path
import os
from typing import List, Dict, Optional

def get_db_path() -> Path:
    # Allow overriding DB path for testing or deployments via env var
    env = os.environ.get("JCHAT_DB_PATH")
    if env:
        return Path(env)
    return Path(__file__).resolve().parent / "themes.db"


def get_conn():
    db_path = get_db_path()
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS themes (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            data TEXT NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()


def save_theme(theme_id: str, name: str, data: str) -> None:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "INSERT OR REPLACE INTO themes (id, name, data) VALUES (?, ?, ?)",
        (theme_id, name, data),
    )
    conn.commit()
    conn.close()


def get_theme(theme_id: str) -> Optional[Dict]:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT id, name, data FROM themes WHERE id = ?", (theme_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        return None
    return {"id": row["id"], "name": row["name"], "data": row["data"]}


def list_themes() -> List[Dict]:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT id, name, data FROM themes ORDER BY name")
    rows = cur.fetchall()
    conn.close()
    return [{"id": r["id"], "name": r["name"], "data": r["data"]} for r in rows]


def delete_theme(theme_id: str) -> bool:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("DELETE FROM themes WHERE id = ?", (theme_id,))
    changed = cur.rowcount
    conn.commit()
    conn.close()
    return changed > 0
