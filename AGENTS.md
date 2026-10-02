# SpeakMate AI - Agent Workspace Instructions

## Mandatory Database Backup Rule
**Before ANY database modification, migration, or schema change:**
1. A backup MUST be performed using `scripts/backup_db.cjs`.
2. Backups must be sanitized (no binary/base64 avatars $> 500$ KB).
3. Backups are saved to `backups/` and synced with `clean_full_backup.sql`.
4. Never execute raw `DROP`, `TRUNCATE`, or destructive operations without explicit confirmation and an immediate prior backup.

## Git Branch & Merging Rules
- **Team Commits on `develop`:** Team members actively push changes to the `develop` branch.
- **Mandatory Pre-Push Check (Every Single Time):**
  Even if no changes are anticipated, always check `develop` first:
  1. Fetch/check `origin/develop` and `origin/main`.
  2. Pull latest `develop` into the local branch (`git pull origin develop`).
  3. Merge team changes with current changes so `main` has everything.
  4. Push to `main` on `origin` (`git push origin main`).
  5. Merge and push `main` back into `develop` on `origin` (`git checkout develop && git merge main && git push origin develop`).
  6. Push `main` to `backup` repo (`git push backup main`).
- **Backup Repository Policy:**
  - `backup` repository strictly maintains **only 2 branches**: `main` and `develop`. Never push or add any feature/individual branches to `backup`.
  - **Daily Pushes (Daytime):** Push **ONLY to `main`** on the `backup` repo (`git push backup main`). Throughout the day, do NOT push to the `develop` branch on `backup`.
  - **Nightly Sync (Every 24 Hours):** The `develop` branch on `backup` is updated and synced with `main` only once per day at night (`git push backup develop`).
- **Teammate / Feature Branches (`ayush`, `kaushtubh`, `nandini`, etc.):**
  - Do NOT push to these branches during regular work. They will receive consolidated updates only at the end of the project.
- **Preserve Team Changes:**
  - Never `--force` push or `git reset --hard` to overwrite `develop` or `main`.
  - Keep all team commits intact alongside incoming changes.
  - Both branches (`main` and `develop`) must end up 100% in sync on `origin` every time, while `backup` receives `main` continuously and `develop` once every 24 hours at night.
