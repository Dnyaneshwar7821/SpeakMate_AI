const fs = require('fs');
const path = require('path');
const { Client } = require(path.resolve(__dirname, '../SpeakMateAI-Frontend/node_modules/pg'));

function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}
loadEnv();

async function checkFks() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const query = `
    SELECT
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
    FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND tc.table_name IN ('speaking_sessions', 'chat_sessions', 'progress', 'lesson_progress', 'vocabulary', 'notification')
    ORDER BY tc.table_name, kcu.column_name;
  `;
  const res = await client.query(query);
  console.log('Activity Foreign Keys:');
  res.rows.forEach(r => console.log(`  ${r.table_name}.${r.column_name} -> ${r.foreign_table_name}.${r.foreign_column_name}`));
  await client.end();
}
checkFks();
