function linkGraph(graph) {
  const linked = {};

  Object.keys(graph.internalGraph).forEach((node) => {
    const visited = new Set();

    follow(node, graph.internalGraph, visited);

    // convert Set → Array (IMPORTANT)
    linked[node] = Array.from(visited);
  });

  return linked;
}

function follow(node, graph, visited) {
  const children = graph[node] || [];

  children.forEach((child) => {
    if (!visited.has(child)) {
      visited.add(child);
      follow(child, graph, visited);
    }
  });
}

module.exports = linkGraph;