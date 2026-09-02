function buildFunctionGraph(parsedFiles) {
  const functionGraph = {};

  parsedFiles.forEach((file) => {
    const filePath = file.file;

    const functions = file.functions || [];
    const requires = file.requires || [];

    functions.forEach((fn) => {
      if (!functionGraph[fn]) {
        functionGraph[fn] = [];
      }

      // --- Heuristic rules (important for now) ---

      // 1. middleware pattern (Express)
      if (fn.toLowerCase().includes("verify")) {
        functionGraph[fn].push("next()");
      }

      // 2. DB-related functions
      requires.forEach((dep) => {
        if (dep.includes("mongoose")) {
          functionGraph[fn].push("mongoose.connect/query");
        }

        if (dep.includes("Expense")) {
          functionGraph[fn].push("Expense Model");
        }
      });
    });
  });

  return functionGraph;
}

module.exports = buildFunctionGraph;