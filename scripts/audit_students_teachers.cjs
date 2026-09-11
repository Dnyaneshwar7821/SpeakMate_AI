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

async function checkDetails() {
  const client = new Client({ connectionString });
  await client.connect();

  try {
    console.log("=== STUDENTS CONSTRAINTS ===");
    const studentConstraints = await client.query(`
      SELECT tc.constraint_name, tc.constraint_type, kcu.column_name, ccu.table_name AS foreign_table, ccu.column_name AS foreign_col
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      LEFT JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
      WHERE tc.table_name = 'students'
      ORDER BY tc.constraint_type, kcu.column_name;
    `);
    console.log(JSON.stringify(studentConstraints.rows, null, 2));

    console.log("=== STUDENTS ROWS ===");
    const studentRows = await client.query(`SELECT id, student_id, first_name, last_name, email, school_name, teacher_id FROM students;`);
    console.table(studentRows.rows);

    console.log("=== TEACHERS CONSTRAINTS ===");
    const teacherConstraints = await client.query(`
      SELECT tc.constraint_name, tc.constraint_type, kcu.column_name, ccu.table_name AS foreign_table, ccu.column_name AS foreign_col
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      LEFT JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
      WHERE tc.table_name = 'teachers'
      ORDER BY tc.constraint_type, kcu.column_name;
    `);
    console.table(teacherConstraints.rows);

    console.log("=== TEACHERS ROWS ===");
    const teacherRows = await client.query(`SELECT id, user_id, employee_id, department, designation FROM teachers;`);
    console.table(teacherRows.rows);

    console.log("=== SCHOOL_ADMINS ROWS ===");
    const schoolAdminRows = await client.query(`SELECT user_id FROM school_admins;`);
    console.table(schoolAdminRows.rows);

    console.log("=== USERS WITH STUDENT/TEACHER/SCHOOL_ADMIN ROLES ===");
    const specialUsers = await client.query(`SELECT id, email, role, active, created_at FROM users WHERE role IN ('STUDENT', 'TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN', 'ADMIN');`);
    console.table(specialUsers.rows);

  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

checkDetails();
