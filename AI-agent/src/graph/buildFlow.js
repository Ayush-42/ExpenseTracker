function buildFlow(parsedFiles) {
  const flows = [];

  parsedFiles.forEach((file) => {
    const filePath = file.file;

    // Only care about route files
    if (!filePath.includes("routes")) return;

    const flow = {
      file: filePath,
      steps: []
    };

    // Step 1: request enters express router
    flow.steps.push("Express Router");

    // Step 2: middleware (heuristic)
    if (file.functions?.length) {
      file.functions.forEach(fn => {
        if (fn.toLowerCase().includes("verify")) {
          flow.steps.push(fn + " middleware");
        }
      });
    }

    // Step 3: model usage (from requires)
    const requires = file.requires || [];

    requires.forEach(dep => {
      if (dep.includes("models") || dep.includes("Model")) {
        flow.steps.push("Database Model");
      }
    });

    // Step 4: database
    flow.steps.push("MongoDB");

    flows.push(flow);
  });

  return { flows };
}

module.exports = buildFlow;