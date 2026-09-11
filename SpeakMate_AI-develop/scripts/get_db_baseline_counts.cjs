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

const tables = [
  'users',
  'admins',
  'schools',
  'school_standards',
  'standard_divisions',
  'teacher_standard_divisions',
  'class_rooms',
  'class_students',
  'subscription_plans',
  'user_subscriptions',
  'payments',
  'invoices',
  'refunds',
  'speaking_sessions',
  'chat_sessions',
  'progress',
  'lesson_progress',
  'vocabulary',
  'notification'
];

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('--- DATABASE BASELINE COUNTS ---');
  const counts = {};
  for (const table of tables) {
    try {
      const res = await client.query(`SELECT count(*)::int as count FROM ${table};`);
      counts[table] = res.rows[0].count;
      console.log(`${table}: ${res.rows[0].count}`);
    } catch (err) {
      counts[table] = `ERROR: ${err.message}`;
      console.log(`${table}: ERROR (${err.message})`);
    }
  }
  fs.writeFileSync(path.resolve(__dirname, '../db_baseline_counts.json'), JSON.stringify(counts, null, 2));
  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
