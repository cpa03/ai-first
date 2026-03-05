// Benchmark to measure the impact of redundant URL parsing in API handlers
const iterations = 100000; // Reduced for lint/test runs
const urlString = 'https://app.example.com/api/v1/resource/123/subresource?param=value&another=true';

function redundantParsing() {
  // Simulate multiple components needing the URL or pathname
  const p1 = new URL(urlString).pathname;
  const p2 = new URL(urlString).pathname;
  const p3 = new URL(urlString).pathname;
  const p4 = new URL(urlString).pathname;
  const p5 = new URL(urlString).pathname;
  return [p1, p2, p3, p4, p5];
}

function optimizedParsing() {
  // Parse once and reuse
  const url = new URL(urlString);
  const pathname = url.pathname;

  const p1 = pathname;
  const p2 = pathname;
  const p3 = pathname;
  const p4 = pathname;
  const p5 = pathname;
  return [p1, p2, p3, p4, p5];
}

console.log(`--- Running Benchmark (${iterations} iterations) ---`);

console.time('Redundant Parsing (5x per op)');
for (let i = 0; i < iterations; i++) {
  redundantParsing();
}
console.timeEnd('Redundant Parsing (5x per op)');

console.time('Optimized Parsing (1x per op)');
for (let i = 0; i < iterations; i++) {
  optimizedParsing();
}
console.timeEnd('Optimized Parsing (1x per op)');
