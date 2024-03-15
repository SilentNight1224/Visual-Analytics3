/**
 * Load data from CSV file asynchronously and render force directed graph
 */
d3.json('A3_data.json').then(data => {
  const forceDirectedGraph = new ForceDirectedGraph({ parentElement: '#force-directed-graph'}, data);
})
.catch(error => console.error(error));