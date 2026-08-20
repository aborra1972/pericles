# ADR-004: Memory Storage

## Status

Proposed

## Context

Pericles maintains per-person, per-device memory that must be:
- **Human-readable**: the PRD mandates Markdown as the canonical representation
- **Searchable**: retrieval of relevant fragments for conversation context
- **Isolated**: data separated by device and by person within each device
- **Deletable**: owner can delete profiles and all associated memories
- **Exportable**: owner can export memory data
- **Configurable**: retention period and storage quota are user-settable

The backend (ADR-003) runs on Railway with PostgreSQL available. Conversational context is maintained during the day; persistent memory survives across sessions.

## Decision

### Storage Model: PostgreSQL + Markdown Files

**Chosen**: PostgreSQL for structured data and search; Markdown files on disk (or object storage) as canonical human-readable representation.

**Alternatives considered**:
- **Markdown files only**: Rejected — full-text search across hundreds of Markdown files is slow; no transactional integrity; no structured queries for retention/quota
- **SQLite**: Rejected — single-writer limitation; Railway provides PostgreSQL natively; no need to manage a separate database file
- **PostgreSQL only (no files)**: Rejected — PRD requires Markdown as canonical representation; users must be able to read and export raw memory files
- **Dedicated vector DB (Pinecone/Weaviate)**: Rejected — overkill for MVP; embeddings are a future enhancement (see "Future: Embedding Index" below)

**Rationale**:
- PostgreSQL handles structured queries: retention enforcement, quota checks, device/person isolation, deletion cascades
- Markdown files satisfy the "canonical representation" requirement and enable human-readable export
- The database stores metadata + search index; the file stores the canonical content
- Railway's PostgreSQL addon is already in the stack (ADR-003)

### Schema

#### `devices` table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Device identifier (set during pairing) |
| `name` | TEXT | User-assigned device name |
| `created_at` | TIMESTAMPTZ | First paired timestamp |
| `config` | JSONB | Device configuration (skins, voice, etc.) |

#### `profiles` table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Profile identifier |
| `device_id` | UUID FK | References `devices.id` |
| `name` | TEXT | Person's name (unique per device) |
| `is_persistent` | BOOLEAN | `true` for known persons, `false` for guests |
| `created_at` | TIMESTAMPTZ | Profile creation timestamp |
| `last_seen_at` | TIMESTAMPTZ | Last interaction timestamp |

#### `memories` table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Memory identifier |
| `device_id` | UUID FK | References `devices.id` |
| `profile_id` | UUID FK | References `profiles.id` |
| `content` | TEXT | Raw Markdown content |
| `summary` | TEXT | One-line summary (generated on save) |
| `category` | TEXT | `preference`, `fact`, `event`, `context`, `instruction` |
| `importance` | INTEGER | 1-5 scale (1=casual, 5=critical) |
| `source` | TEXT | `conversation`, `user_correction`, `daily_briefing`, `system` |
| `created_at` | TIMESTAMPTZ | When the memory was created |
| `expires_at` | TIMESTAMPTZ | Auto-deletion timestamp (NULL = never) |
| `metadata` | JSONB | Flexible key-value pairs (tags, context) |

#### Full-text search index

```sql
CREATE INDEX idx_memories_search ON memories
  USING GIN (to_tsvector('spanish', content || ' ' || COALESCE(summary, '')));
```

Spanish language stemming for search (Pericles speaks Spanish by default).

### File Structure

Each device gets a directory. Each person gets a subdirectory. Memories are individual Markdown files.

```
data/
  {device-id}/
    {profile-id}/
      memories/
        2025-08-20-cooking-preference.md
        2025-08-20-boca-match-result.md
        2025-08-19-daily-briefing.md
      profile.md          # Profile metadata (YAML frontmatter)
    _guest/
      memories/           # Guest session memories (ephemeral)
```

**Memory file format**:

```markdown
---
id: a1b2c3d4
category: preference
importance: 3
source: conversation
created: 2025-08-20T14:30:00Z
expires: null
tags: [cocina, recetas]
---

Le encanta la pasta al pesto. Pide receta fácil los martes.
```

### Retrieval Strategy

**MVP (this ADR)**: PostgreSQL full-text search with Spanish stemming.

```
User asks question
  → Backend extracts keywords
  → PostgreSQL ILIKE + full-text search across content + summary
  → Results ranked by: importance DESC, recency DESC, relevance score
  → Top N fragments injected into AI context
```

**Future enhancement** (not MVP): embedding-based semantic search. The Markdown files remain canonical; the index adds vector similarity. This ADR structures the schema to accommodate embeddings later (add `embedding VECTOR(1536)` column to `memories` table).

### Retention Policies

Configured per-device by the owner:

| Setting | Default | Range | Description |
|---------|---------|-------|-------------|
| `retention_days` | 90 | 7-365 | Auto-delete memories older than N days |
| `max_memories` | 1000 | 100-10000 | Maximum memories per profile |
| `auto_summarize` | true | — | Merge old low-importance memories into summaries |

Retention runs as a daily cron job (Railway cron or internal scheduler):
1. Query `memories WHERE expires_at < NOW()` → delete from DB and filesystem
2. Query `memories WHERE created_at < NOW() - interval 'retention_days' AND importance < 3` → archive or delete
3. Query per-profile memory count → enforce `max_memories` by deleting oldest low-importance

### Deletion

Two modes:

**Soft delete** (default): `deleted_at` timestamp added. Memory is hidden from search but recoverable within 30 days.

**Hard delete**: Owner explicitly confirms. Removes from PostgreSQL AND filesystem. Irrecoverable.

API: `DELETE /api/devices/:deviceId/profiles/:profileId/memories/:memoryId?hard=false`

Bulk deletion: `DELETE /api/devices/:deviceId/profiles/:profileId` — cascades to all memories.

### Export

`GET /api/devices/:deviceId/profiles/:profileId/export` returns a ZIP containing:
- `profile.md` — profile metadata
- `memories/` — all Markdown files with YAML frontmatter
- `export.json` — structured JSON for programmatic import

## Consequences

- **Dual storage**: Markdown files are canonical; PostgreSQL is the search/query engine. If they diverge, the file wins.
- **Spanish search**: Full-text search uses Spanish stemming. Other languages added later via language detection.
- **Retention is automated**: Owners configure policies; the backend enforces them without manual intervention.
- **Guest memories are ephemeral**: No `profile_id` in the `memories` table for guests; session-only context.
- **Export is complete**: Owners can fully extract their data (GDPR-aligned).

## Test Strategy

- Schema migration: run against test PostgreSQL instance
- CRUD operations: create device → create profile → create memory → search → verify results
- Full-text search: insert memories with known content, verify search returns correct results with Spanish stemming
- Retention: insert memories with past `expires_at`, verify cron deletes them
- Deletion: verify soft delete hides from search, hard delete removes from DB and filesystem
- Export: verify ZIP contains all files and matches DB state

## Rollback Boundary

This ADR defines the memory schema and storage strategy. Reverting means choosing a different storage engine and migrating data. Application code that reads/writes memories would need updating.
