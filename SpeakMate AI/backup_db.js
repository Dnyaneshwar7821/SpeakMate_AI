import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';

const connectionString = "postgres://neondb_owner:npg_tpRx70fTHDdc@ep-summer-boat-azuqu2ws.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

async function dumpDatabase() {
  const client = new Client({ connectionString });
  console.log("Connecting to Neon PostgreSQL Cloud Database...");
  
  try {
    await client.connect();
    console.log("Connected successfully!");

    // Get list of all public tables
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    `);

    const tables = tablesRes.rows.map(r => r.table_name);
    console.log(`Found ${tables.length} tables:`, tables);

    const fullBackup = {};
    let sqlContent = `-- SpeakMate AI Database Backup\n-- Exported At: ${new Date().toISOString()}\n\n`;

    for (const table of tables) {
      console.log(`Exporting table '${table}'...`);
      
      // Get table structure/columns
      const colRes = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = $1;
      `, [table]);

      // Get rows
      const dataRes = await client.query(`SELECT * FROM "${table}";`);
      
      fullBackup[table] = {
        columns: colRes.rows,
        rowCount: dataRes.rows.length,
        rows: dataRes.rows
      };

      sqlContent += `-- Table: ${table}\n`;
      if (dataRes.rows.length > 0) {
        const columnsStr = colRes.rows.map(c => `"${c.column_name}"`).join(', ');
        
        for (const row of dataRes.rows) {
          const valuesStr = colRes.rows.map(c => {
            const val = row[c.column_name];
            if (val === null || val === undefined) return 'NULL';
            if (typeof val === 'number' || typeof val === 'boolean') return val;
            if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
            return `'${String(val).replace(/'/g, "''")}'`;
          }).join(', ');

          sqlContent += `INSERT INTO "${table}" (${columnsStr}) VALUES (${valuesStr});\n`;
        }
      }
      sqlContent += `\n`;
    }

    // Save JSON backup
    const jsonPath = path.resolve('c:/Users/Dnyaneshwar Algule/OneDrive/Desktop/SpeakMate_AI/speakmate_db_backup.json');
    fs.writeFileSync(jsonPath, JSON.stringify(fullBackup, null, 2), 'utf-8');
    console.log(`Saved JSON backup to: ${jsonPath}`);

    // Save SQL backup
    const sqlPath = path.resolve('c:/Users/Dnyaneshwar Algule/OneDrive/Desktop/SpeakMate_AI/speakmate_db_backup.sql');
    fs.writeFileSync(sqlPath, sqlContent, 'utf-8');
    console.log(`Saved SQL backup to: ${sqlPath}`);

    console.log("BACKUP COMPLETED SUCCESSFULLY!");
  } catch (error) {
    console.error("Backup failed with error:", error);
  } finally {
    await client.end();
  }
}

dumpDatabase();
