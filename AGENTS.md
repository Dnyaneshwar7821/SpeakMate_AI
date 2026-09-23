# SpeakMate AI - Agent Workspace Instructions

## Mandatory Database Backup Rule
**Before ANY database modification, migration, or schema change:**
1. A backup MUST be performed using `scripts/backup_db.cjs`.
2. Backups must be sanitized (no binary/base64 avatars $> 64$ KB).
3. Backups are saved to `backups/` and synced with `clean_full_backup.sql`.
4. Never execute raw `DROP`, `TRUNCATE`, or destructive operations without explicit confirmation and an immediate prior backup.

## Git Branch & Merging Rules
- **Team Commits on `develop`:** Team members actively push changes to the `develop` branch.
- **Mandatory Pre-Push Check (Every Single Time):**
  Even if no changes are anticipated, always check `develop` first:
  1. Fetch/check `origin/develop` and `origin/main`.
  2. Pull latest `develop` into the local branch (`git pull origin develop`).
  3. Merge team changes with current changes so `main` has everything.
  4. Push to `main`.
  5. Merge and push `main` back into `develop` (`git checkout develop && git merge main && git push origin develop`).
- **Preserve Team Changes:**
  - Never `--force` push or `git reset --hard` to overwrite `develop` or `main`.
  - Keep all team commits intact alongside incoming changes.
  - Both branches must end up 100% in sync every time.
