# Database Backup & Protection Policy

## Critical Rule
**EVERY TIME before any database modification, schema migration, data mutation, or database platform migration (e.g., Neon <-> Aiven <-> Local), a full verified backup MUST be taken first.**

## Mandatory Workflow
1. **Always Run Backup First**:
   Execute the automated backup tool:
   ```bash
   node scripts/backup_db.cjs "<DATABASE_URL>"
   ```
   Or set the environment variable:
   ```bash
   DATABASE_URL="<connection_string>" node scripts/backup_db.cjs
   ```

2. **Backup Storage & Naming**:
   - Timestamped SQL dumps are saved to: `backups/backup_YYYY_MM_DD_HHMMSS.sql`
   - Timestamped JSON dumps are saved to: `backups/backup_YYYY_MM_DD_HHMMSS.json`
   - Single source of truth master files are updated at: `clean_full_backup.sql` and `speakmate_db_backup.json`

3. **Anti-Bloat & Sanitization**:
   - The backup script automatically sanitizes and resets oversized Base64 avatar strings (`> 64 KB`) in memory so that backup files never bloat repository storage or burn egress bandwidth.

4. **Safety Verification**:
   - Check that all tables and rows are preserved before executing destructive or modifying SQL queries.
