const resolveImport = require("./resolvePath");
const path = require("path");

function isExternal(dep) {
  return !dep.startsWith(".");
}

function buildGraph(parsedData) {
  const internalGraph = {};
  const externalDeps = {};

  parsedData.forEach((file) => {
    const fileName = getFileName(file.file);

    internalGraph[fileName] = [];
    externalDeps[fileName] = [];

    const deps = [
      ...(file.imports || []),
      ...(file.requires || [])
    ];

    deps.forEach((dep) => {
      if (isExternal(dep)) {
        externalDeps[fileName].push(dep);
      } else {
        internalGraph[fileName].push(resolvePath(dep, file.file));
      }
    });
  });

  return {
    internalGraph,
    externalDeps
  };
}

// Convert file path → clean name (optional helper)
function getFileName(filePath) {
  return filePath.split("/").pop().replace(".js", "");
}

// Resolve relative imports → absolute file paths
function resolvePath(dep, currentFile) {
  if (dep.startsWith(".")) {
    return path.resolve(path.dirname(currentFile), dep + ".js");
  }
  return dep;
}

module.exports = buildGraph;