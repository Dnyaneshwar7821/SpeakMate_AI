# SpeakMate AI - Agent Workspace Instructions

## Mandatory Database Backup Rule
**Before ANY database modification, migration, or schema change:**
1. A backup MUST be performed using `scripts/backup_db.cjs`.
2. Backups must be sanitized (no binary/base64 avatars $> 64$ KB).
3. Backups are saved to `backups/` and synced with `clean_full_backup.sql`.
4. Never execute raw `DROP`, `TRUNCATE`, or destructive operations without explicit confirmation and an immediate prior backup.
