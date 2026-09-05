const fs = require('fs');
const path = require('path');

// Resolve pg from SpeakMate AI node_modules
const pgPath = path.resolve(__dirname, '../SpeakMate AI/node_modules/pg');
const { Client } = require(pgPath);

const DEFAULT_DB_URL = process.env.DATABASE_URL || 
  process.env.SPRING_DATASOURCE_URL || 
  'postgresql://neondb_owner:npg_rj6FX9QgReyV@ep-summer-boat-azuqu2ws-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const connectionString = process.argv[2] || DEFAULT_DB_URL;

function sanitizeUrlForLog(url) {
  try {
    const parsed = new URL(url);
    if (parsed.password) parsed.password = '******';
    return parsed.toString();
  } catch {
    return 'PostgreSQL database';
  }
}

async function runBackup() {
  const startTime = Date.now();
  console.log("==================================================");
  console.log("SPEAKMATE AI - AUTOMATED DATABASE BACKUP");
  console.log("Connecting to:", sanitizeUrlForLog(connectionString));
  console.log("==================================================");

  const client = new Client({ connectionString });
  await client.connect();

  try {
    const backupDir = path.resolve(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:T]/g, '_').split('.')[0];
    const timestampedSqlPath = path.join(backupDir, `backup_${timestamp}.sql`);
    const timestampedJsonPath = path.join(backupDir, `backup_${timestamp}.json`);
    const rootSqlPath = path.resolve(__dirname, '../clean_full_backup.sql');
    const rootJsonPath = path.resolve(__dirname, '../speakmate_db_backup.json');

    // 1. Fetch all public base tables
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    const tables = tablesRes.rows.map(r => r.table_name);
    console.log(`Found ${tables.length} tables in database.`);

    const backupJson = {};
    let sqlContent = `-- ==================================================\n`;
    sqlContent += `-- SpeakMate AI Automated Backup\n`;
    sqlContent += `-- Timestamp: ${now.toISOString()}\n`;
    sqlContent += `-- Tables: ${tables.length}\n`;
    sqlContent += `-- ==================================================\n\n`;
    sqlContent += `SET statement_timeout = 0;\nSET client_encoding = 'UTF8';\n\n`;

    const summary = [];

    for (const table of tables) {
      // Get column metadata
      const colsRes = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `, [table]);
      const columns = colsRes.rows;

      // Get rows
      const rowsRes = await client.query(`SELECT * FROM "${table}";`);
      const rows = rowsRes.rows;

      // Sanitize any oversize avatar string (> 64 KB) in memory
      let sanitizedCount = 0;
      for (const row of rows) {
        if (row.avatar && typeof row.avatar === 'string' && row.avatar.length > 65536) {
          row.avatar = '';
          sanitizedCount++;
        }
      }

      backupJson[table] = {
        rowCount: rows.length,
        columns,
        rows
      };

      summary.push({
        table,
        rows: rows.length,
        sanitizedBloat: sanitizedCount > 0 ? `${sanitizedCount} oversized avatar(s) reset` : 'Clean'
      });

      // SQL export: generate CREATE TABLE statement
      sqlContent += `-- Table: ${table}\n`;
      sqlContent += `CREATE TABLE IF NOT EXISTS public."${table}" (\n`;
      const colDefs = columns.map(c => {
        let def = `  "${c.column_name}" ${c.data_type}`;
        if (c.is_nullable === 'NO') def += ' NOT NULL';
        if (c.column_default) def += ` DEFAULT ${c.column_default}`;
        return def;
      });
      sqlContent += colDefs.join(',\n');
      sqlContent += `\n);\n\n`;

      // SQL export: generate INSERT statements
      if (rows.length > 0) {
        const colNames = columns.map(c => `"${c.column_name}"`).join(', ');
        for (const row of rows) {
          const values = columns.map(c => {
            const val = row[c.column_name];
            if (val === null || val === undefined) return 'NULL';
            if (typeof val === 'number' || typeof val === 'boolean') return val;
            if (val instanceof Date) return `'${val.toISOString()}'`;
            if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
            return `'${String(val).replace(/'/g, "''")}'`;
          }).join(', ');
          sqlContent += `INSERT INTO public."${table}" (${colNames}) VALUES (${values}) ON CONFLICT DO NOTHING;\n`;
        }
        sqlContent += `\n`;
      }
    }

    // Write files
    fs.writeFileSync(timestampedSqlPath, sqlContent, 'utf8');
    fs.writeFileSync(rootSqlPath, sqlContent, 'utf8');
    fs.writeFileSync(timestampedJsonPath, JSON.stringify(backupJson, null, 2), 'utf8');
    fs.writeFileSync(rootJsonPath, JSON.stringify(backupJson, null, 2), 'utf8');

    console.table(summary);
    console.log("==================================================");
    console.log(` BACKUP COMPLETED in ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
    console.log(` Timestamped SQL:  ${timestampedSqlPath}`);
    console.log(` Latest Master SQL: ${rootSqlPath}`);
    console.log(` Timestamped JSON: ${timestampedJsonPath}`);
    console.log(` Latest Master JSON: ${rootJsonPath}`);
    console.log("==================================================");

  } catch (err) {
    console.error("Backup failed with error:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runBackup();
