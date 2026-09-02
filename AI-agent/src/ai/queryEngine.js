function answerQuery(query, data) {
  query = query.toLowerCase();

  // 1. API flow question
  if (query.includes("how") && query.includes("expense")) {
    const flow = data.flow.flows[0];

    return `
Flow for expenses API:
${flow.steps.join(" → ")}
`;
  }

  // 2. impact analysis
  if (query.includes("break") || query.includes("change")) {
    return `
Changing Expense.js will affect:
${data.graph.internalGraph.expenses.join(", ")}
`;
  }

  // 3. general architecture
  if (query.includes("explain")) {
    return `
Backend structure:
- server entry point
- routes handle API
- models handle DB
- mongoose for MongoDB
`;
  }

  return "I don't understand the query yet.";
}

module.exports = answerQuery;