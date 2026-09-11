const http = require('http');

const routes = [
  // Learner
  '/',
  '/login',
  '/register',
  '/dashboard',
  '/ai-chat',
  '/speaking',
  '/lessons',
  '/vocabulary',
  '/progress',
  '/profile',
  '/settings',
  '/avatar-embed',
  // Admin
  '/admin/login',
  '/admin/dashboard',
  '/admin/insights',
  '/admin/users',
  '/admin/add-school',
  '/admin/subscription',
  '/admin/profile',
  '/admin/settings',
  '/admin/notifications',
  // School Admin
  '/school-admin/login',
  '/school-admin/dashboard',
  '/school-admin/students',
  '/school-admin/teachers',
  '/school-admin/results',
  '/school-admin/insights',
  '/school-admin/add-teacher',
  '/school-admin/notifications',
  // Teacher
  '/teacher/login',
  '/teacher/dashboard',
  '/teacher/analytics',
  '/teacher/students',
  '/teacher/reports',
  '/teacher/settings',
  '/teacher/notifications'
];

async function checkRoute(route) {
  return new Promise((resolve) => {
    http.get('http://localhost:5173' + route, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ route, status: res.statusCode, ok: res.statusCode === 200 && data.includes('id="root"') });
      });
    }).on('error', (err) => {
      resolve({ route, status: 'ERROR', error: err.message, ok: false });
    });
  });
}

async function run() {
  console.log(`Testing ${routes.length} routes on http://localhost:5173...`);
  let successCount = 0;
  for (const r of routes) {
    const res = await checkRoute(r);
    if (res.ok) {
      successCount++;
    } else {
      console.log('FAIL:', r, res.status, res.error || '');
    }
  }
  console.log(`Results: ${successCount} / ${routes.length} routes returned HTTP 200 with valid root container.`);
  if (successCount === routes.length) {
    console.log('ALL ROUTES PASSED VERIFICATION.');
  } else {
    process.exit(1);
  }
}

run();
