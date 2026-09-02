const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const fs = require("fs");

function parseFile(filePath) {
  const code = fs.readFileSync(filePath, "utf-8");

  const ast = parser.parse(code, {
    sourceType: "unambiguous",
    plugins: ["jsx", "typescript"]
  });

  const data = {
    imports: [],
    requires: [],
    functions: []
  };

  traverse(ast, {
    // ES Modules
    ImportDeclaration(path) {
      data.imports.push(path.node.source.value);
    },

    // CommonJS require()
    CallExpression(path) {
      if (
        path.node.callee.name === "require"
      ) {
        const arg = path.node.arguments[0];
        if (arg && arg.value) {
          data.requires.push(arg.value);
        }
      }
    },

    // Function declarations
    FunctionDeclaration(path) {
      if (path.node.id?.name) {
        data.functions.push(path.node.id.name);
      }
    },

    // Arrow functions
    VariableDeclarator(path) {
      if (
        path.node.init &&
        (path.node.init.type === "ArrowFunctionExpression")
      ) {
        data.functions.push(path.node.id.name);
      }
    }
  });

  return data;
}

module.exports = parseFile;