const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const ADMIN_SRC = path.join(ROOT, "Admin_Frontend");
const BASE_FRONTEND = path.join(ROOT, "SpeakMateAI-Frontend");
const MOBILE_APP = path.join(ROOT, "SpeakMateAI-Mobile_App");
const BACKEND = path.join(ROOT, "SpeakMateAI-Backend");

console.log("=== PHASE 5B FRONTEND INTEGRATION SCRIPT ===");
console.log("Admin Source:", ADMIN_SRC);
console.log("Base Frontend:", BASE_FRONTEND);

// Helper: Ensure directory exists
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Helper: Copy directory recursively with import rewriting
function copyDirWithRewrite(src, dest, isPortalComponent = true) {
  if (!fs.existsSync(src)) {
    console.warn(`Source directory does not exist: ${src}`);
    return;
  }
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirWithRewrite(srcPath, destPath, isPortalComponent);
    } else if (entry.isFile()) {
      if (entry.name.endsWith(".js") || entry.name.endsWith(".jsx")) {
        let content = fs.readFileSync(srcPath, "utf8");
        if (isPortalComponent) {
          // Normalize service imports
          content = content.replace(/(['"])\.\.\/\.\.\/src\/services\//g, "$1@services/admin/");
          content = content.replace(/(['"])\.\.\/src\/services\//g, "$1@services/admin/");
          // Normalize utils imports
          content = content.replace(/(['"])\.\.\/\.\.\/src\/utils\//g, "$1@utils/");
          content = content.replace(/(['"])\.\.\/src\/utils\//g, "$1@utils/");
          // Normalize constants imports
          content = content.replace(/(['"])\.\.\/\.\.\/src\/constants\//g, "$1@constants/");
          content = content.replace(/(['"])\.\.\/src\/constants\//g, "$1@constants/");
          // Normalize context imports for portal isolation
          content = content.replace(/(['"])@context\/AuthContext(['"])/g, "$1@/Admin_panel/context/AuthContext$2");
          content = content.replace(/(['"])@context\/ThemeContext(['"])/g, "$1@/Admin_panel/context/ThemeContext$2");
        }
        fs.writeFileSync(destPath, content, "utf8");
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

// Step 1: Copy Admin_Frontend/admin-dashboard -> SpeakMateAI-Frontend/src/frontend/admin-dashboard
console.log("\n[1/7] Copying admin-dashboard...");
copyDirWithRewrite(
  path.join(ADMIN_SRC, "admin-dashboard"),
  path.join(BASE_FRONTEND, "src", "frontend", "admin-dashboard"),
  true
);

// Step 2: Copy Admin_Frontend/school-admin-dashboard -> SpeakMateAI-Frontend/src/frontend/school-admin-dashboard
console.log("[2/7] Copying school-admin-dashboard...");
copyDirWithRewrite(
  path.join(ADMIN_SRC, "school-admin-dashboard"),
  path.join(BASE_FRONTEND, "src", "frontend", "school-admin-dashboard"),
  true
);

// Step 3: Copy Admin_Frontend/Admin_panel -> SpeakMateAI-Frontend/src/Admin_panel
console.log("[3/7] Copying Admin_panel...");
copyDirWithRewrite(
  path.join(ADMIN_SRC, "Admin_panel"),
  path.join(BASE_FRONTEND, "src", "Admin_panel"),
  true
);

// Step 4: Copy Admin_Frontend/src/services -> SpeakMateAI-Frontend/src/services/admin
console.log("[4/7] Copying portal services to src/services/admin...");
ensureDir(path.join(BASE_FRONTEND, "src", "services", "admin"));
const serviceFiles = fs.readdirSync(path.join(ADMIN_SRC, "src", "services"));
for (const file of serviceFiles) {
  const srcP = path.join(ADMIN_SRC, "src", "services", file);
  const destP = path.join(BASE_FRONTEND, "src", "services", "admin", file);
  if (fs.statSync(srcP).isFile()) {
    let content = fs.readFileSync(srcP, "utf8");
    // If services import apiClient via relative path ./apiClient, that stays ./apiClient
    fs.writeFileSync(destP, content, "utf8");
  }
}

// Step 5: Copy portal hooks, utils, constants
console.log("[5/7] Copying portal hooks, utils, and constants...");
// Hook: useNotifications.js
const hookSrc = path.join(ADMIN_SRC, "src", "hooks", "useNotifications.js");
if (fs.existsSync(hookSrc)) {
  let hookContent = fs.readFileSync(hookSrc, "utf8");
  hookContent = hookContent.replace(/(['"])@context\/AuthContext(['"])/g, "$1@/Admin_panel/context/AuthContext$2");
  hookContent = hookContent.replace(/(['"])\.\.\/services\//g, "$1@services/admin/");
  fs.writeFileSync(path.join(BASE_FRONTEND, "src", "hooks", "useNotifications.js"), hookContent, "utf8");
}

// Utils: notificationNavigation.js, insigniaHelper.js, adminAvatarHelper.js
const utilsToCopy = ["notificationNavigation.js", "insigniaHelper.js", "adminAvatarHelper.js"];
for (const utilFile of utilsToCopy) {
  const utilSrc = path.join(ADMIN_SRC, "src", "utils", utilFile);
  if (fs.existsSync(utilSrc)) {
    let utilContent = fs.readFileSync(utilSrc, "utf8");
    utilContent = utilContent.replace(/(['"])\.\.\/services\//g, "$1@services/admin/");
    fs.writeFileSync(path.join(BASE_FRONTEND, "src", "utils", utilFile), utilContent, "utf8");
  }
}

// Constants: standardOptions.js
const stdOptSrc = path.join(ADMIN_SRC, "src", "constants", "standardOptions.js");
if (fs.existsSync(stdOptSrc)) {
  fs.copyFileSync(stdOptSrc, path.join(BASE_FRONTEND, "src", "constants", "standardOptions.js"));
}

// Step 6: Safe merge of portal components into src/components/common and src/components/teacher
console.log("[6/7] Merging portal common components without overwriting learner components...");
const portalCommonDir = path.join(ADMIN_SRC, "Admin_panel", "components", "common");
const baseCommonDir = path.join(BASE_FRONTEND, "src", "components", "common");
ensureDir(baseCommonDir);

const nonCollidingCommon = [
  "InsigniaBadge.jsx",
  "InsigniaStudioModal.jsx",
  "SchoolSelect.jsx",
  "AdminAlert.jsx",
  "AdminButton.jsx",
  "AdminCard.jsx",
  "AdminInput.jsx",
  "LoadingSpinner.jsx"
];

for (const comp of nonCollidingCommon) {
  const compSrc = path.join(portalCommonDir, comp);
  if (fs.existsSync(compSrc)) {
    let compContent = fs.readFileSync(compSrc, "utf8");
    compContent = compContent.replace(/(['"])@context\/ThemeContext(['"])/g, "$1@/Admin_panel/context/ThemeContext$2");
    compContent = compContent.replace(/(['"])\.\.\/\.\.\/src\/services\//g, "$1@services/admin/");
    fs.writeFileSync(path.join(baseCommonDir, comp), compContent, "utf8");
    console.log(`  Added ${comp} to src/components/common/`);
  }
}

// Teacher layout alias support: src/components/teacher/layout/TeacherDashboardLayout.jsx
const teacherLayoutDir = path.join(BASE_FRONTEND, "src", "components", "teacher", "layout");
ensureDir(teacherLayoutDir);
fs.writeFileSync(
  path.join(teacherLayoutDir, "TeacherDashboardLayout.jsx"),
  `export { default, TeacherDashboardLayout } from "@/Admin_panel/components/teacher/layout/TeacherDashboardLayout";\n`,
  "utf8"
);
console.log("  Configured TeacherDashboardLayout re-export bridge");

// Step 7: Enhance portal AuthContext & ThemeContext to export aliases
console.log("[7/7] Updating portal AuthContext and ThemeContext exports...");
const portalAuthCtxPath = path.join(BASE_FRONTEND, "src", "Admin_panel", "context", "AuthContext.jsx");
if (fs.existsSync(portalAuthCtxPath)) {
  let authCtx = fs.readFileSync(portalAuthCtxPath, "utf8");
  if (!authCtx.includes("useAdminAuth")) {
    authCtx += "\n// Phase 5B Aliases for portal isolation\nexport const useAdminAuth = useAuth;\nexport const AdminAuthProvider = AuthProvider;\n";
    fs.writeFileSync(portalAuthCtxPath, authCtx, "utf8");
  }
}

const portalThemeCtxPath = path.join(BASE_FRONTEND, "src", "Admin_panel", "context", "ThemeContext.jsx");
if (fs.existsSync(portalThemeCtxPath)) {
  let themeCtx = fs.readFileSync(portalThemeCtxPath, "utf8");
  if (!themeCtx.includes("useAdminTheme")) {
    themeCtx += "\n// Phase 5B Aliases for portal theme\nexport const useAdminTheme = useTheme;\nexport const AdminThemeProvider = ThemeProvider;\n";
    fs.writeFileSync(portalThemeCtxPath, themeCtx, "utf8");
  }
}

console.log("\n=== INTEGRATION COPY COMPLETE ===");
