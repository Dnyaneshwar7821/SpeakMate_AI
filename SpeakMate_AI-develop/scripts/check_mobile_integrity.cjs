const fs = require("fs");
const path = require("path");

const targetDir = path.resolve(__dirname, "../SpeakMateAI-Mobile_App");
const startTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago

let totalFiles = 0;
let modifiedFiles = [];

function checkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".git") {
        checkDir(fullPath);
      }
    } else {
      totalFiles++;
      const stat = fs.statSync(fullPath);
      if (stat.mtimeMs > startTime) {
        modifiedFiles.push({ file: fullPath, mtime: new Date(stat.mtimeMs).toISOString() });
      }
    }
  }
}

checkDir(targetDir);
console.log(`Total mobile files scanned (excluding node_modules): ${totalFiles}`);
console.log(`Mobile files modified in last 24h: ${modifiedFiles.length}`);
if (modifiedFiles.length > 0) {
  console.log("Modified files:", modifiedFiles);
}
