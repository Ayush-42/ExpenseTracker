const express = require("express");
const scanProject = require("./scanner");
const parseFile = require("./parser/astParser");
const path = require("path");
const buildGraph = require("./graph/buildGraph");
const linkGraph = require("./graph/linkGraph");
const buildFlow = require("./graph/buildFlow");
const functionGraph = require("./graph/functionGraph");
const answerQuery = require("./ai/queryEngine");

const app = express();
app.use(express.json());
let globalScanData = null;

app.get("/scan", (req, res) => {
  try {
    const projectPath = path.resolve(__dirname, "../../server");

    const files = scanProject(projectPath);

    const parsedFiles = files.map((filePath) => {
      return {
        file: filePath,
        ...parseFile(filePath)
      };
    });

    const graph = buildGraph(parsedFiles);
    const linkedGraph = linkGraph(graph);
    const flow = buildFlow(parsedFiles);
    const funcGraph = functionGraph(parsedFiles);

    res.json({
      totalFiles: parsedFiles.length,
      data: parsedFiles,
      graph,
      linkedGraph,
      flow,
      funcGraph
    });

    globalScanData = {
        data: parsedFiles,
        graph,
        linkedGraph,
        flow,
        funcGraph
    };

  } catch (err) {
    console.log("SCAN ERROR:", err);

    res.status(500).json({
      error: "Scan failed",
      details: err.message
    });
  }
});

app.post("/ask", (req, res) => {
  const { question } = req.body;

  if (!globalScanData) {
    return res.json({
      error: "Run /scan first before asking questions"
    });
  }

  const result = answerQuery(question, globalScanData);

  res.json({ answer: result });
});

app.listen(5001, () => {
  console.log("AI Agent running on port 5001");
});