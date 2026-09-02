const fs = require("fs");
const path = require("path");

function scanProject(dir, files = []) {
  const items = fs.readdirSync(dir);

  items.forEach((item) => {
    const fullPath = path.join(dir, item);

    if (fs.statSync(fullPath).isDirectory()) {
      if (item !== "node_modules") {
        scanProject(fullPath, files);
      }
    } else {
      if (fullPath.endsWith(".js") || fullPath.endsWith(".jsx")) {
        files.push(fullPath);
      }
    }
  });

  return files;
}

module.exports = scanProject;