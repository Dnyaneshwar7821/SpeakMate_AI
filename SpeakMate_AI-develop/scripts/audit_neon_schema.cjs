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

const connectionString = process.env.DATABASE_URL;

async function auditDatabase() {
  const client = new Client({ connectionString });
  await client.connect();

  let report = "# NEON DATABASE COMPREHENSIVE AUDIT REPORT\n\n";

  try {
    // 1. Roles in users
    const userRoles = await client.query('SELECT role, count(*)::int as count FROM users GROUP BY role ORDER BY count DESC;');
    report += "## 1. Roles in users table\n```json\n" + JSON.stringify(userRoles.rows, null, 2) + "\n```\n\n";

    // Check invalid/unexpected roles
    const invalidRoles = await client.query(`
      SELECT id, email, role FROM users 
      WHERE role NOT IN ('USER', 'STUDENT', 'TEACHER', 'SCHOOL_ADMIN', 'ADMIN', 'SUPER_ADMIN')
         OR role IS NULL;
    `);
    report += "## 2. Invalid/Legacy User Roles Check\n```json\n" + JSON.stringify(invalidRoles.rows, null, 2) + "\n```\n\n";

    // 2. Admins table
    const adminRoles = await client.query('SELECT role, count(*)::int as count FROM admins GROUP BY role ORDER BY count DESC;');
    report += "## 3. Roles in admins table\n```json\n" + JSON.stringify(adminRoles.rows, null, 2) + "\n```\n\n";

    const admins = await client.query('SELECT id, full_name, email, role, status FROM admins;');
    report += "## 4. Admins List\n```json\n" + JSON.stringify(admins.rows, null, 2) + "\n```\n\n";

    // 3. Activity FKs
    const activityFks = await client.query(`
      SELECT
          tc.table_name, 
          kcu.column_name, 
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name,
          tc.constraint_name
      FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name IN (
          'speaking_sessions', 'chat_sessions', 'progress', 
          'lesson_progress', 'vocabulary', 'notification', 
          'payments', 'results', 'students', 'teachers', 'school_admins',
          'user_subscriptions', 'invoices', 'refunds', 'settings', 'onboarding'
        )
      ORDER BY tc.table_name, kcu.column_name;
    `);
    report += "## 5. Activity & Subscriptions Foreign Keys\n```json\n" + JSON.stringify(activityFks.rows, null, 2) + "\n```\n\n";

    // 4. Any FK pointing to students table
    const fkToStudents = await client.query(`
      SELECT
          tc.table_name, 
          kcu.column_name, 
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name,
          tc.constraint_name
      FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND ccu.table_name = 'students';
    `);
    report += "## 6. Foreign Keys Pointing to students table\n```json\n" + JSON.stringify(fkToStudents.rows, null, 2) + "\n```\n\n";

    // 5. School Architecture Table Counts
    const schoolCounts = await client.query(`
      SELECT 
        (SELECT COUNT(*)::int FROM schools) AS schools,
        (SELECT COUNT(*)::int FROM school_standards) AS school_standards,
        (SELECT COUNT(*)::int FROM standard_divisions) AS standard_divisions,
        (SELECT COUNT(*)::int FROM teacher_standard_divisions) AS teacher_standard_divisions,
        (SELECT COUNT(*)::int FROM class_rooms) AS class_rooms,
        (SELECT COUNT(*)::int FROM class_students) AS class_students,
        (SELECT COUNT(*)::int FROM school_admins) AS school_admins,
        (SELECT COUNT(*)::int FROM teachers) AS teachers,
        (SELECT COUNT(*)::int FROM students) AS students;
    `);
    report += "## 7. School Architecture Counts\n```json\n" + JSON.stringify(schoolCounts.rows[0], null, 2) + "\n```\n\n";

    // 6. Subscriptions / Payments / Invoices / Refunds
    const subCounts = await client.query(`
      SELECT
        (SELECT COUNT(*)::int FROM subscription_plans) AS subscription_plans,
        (SELECT COUNT(*)::int FROM user_subscriptions) AS user_subscriptions,
        (SELECT COUNT(*)::int FROM payments) AS payments,
        (SELECT COUNT(*)::int FROM invoices) AS invoices,
        (SELECT COUNT(*)::int FROM refunds) AS refunds;
    `);
    report += "## 8. Subscriptions & Billing Counts\n```json\n" + JSON.stringify(subCounts.rows[0], null, 2) + "\n```\n\n";

    // Write report
    const reportPath = path.resolve(__dirname, '../backups/audit_report.md');
    fs.writeFileSync(reportPath, report, 'utf8');
    console.log("Audit report written to:", reportPath);

  } catch (err) {
    console.error("Audit failed:", err);
  } finally {
    await client.end();
  }
}

auditDatabase();
