const path = require("path");
const fs = require("fs");

function resolveImport(importPath, currentFile) {
  if (
    importPath.startsWith(".")
  ) {
    return path
      .resolve(path.dirname(currentFile), importPath + ".js");
  }

  return importPath; // node modules like express, mongoose
}

module.exports = resolveImport;