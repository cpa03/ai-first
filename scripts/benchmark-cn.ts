import { cn } from '../src/lib/utils';
import { performance } from 'perf_hooks';

function benchmark(name: string, fn: () => void, iterations: number = 1000000) {
  // Warm up
  for (let i = 0; i < 10000; i++) {
    fn();
  }

  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const end = performance.now();
  const duration = end - start;
  const avg = (duration / iterations) * 1000000; // nanoseconds

  console.log(`${name}: ${duration.toFixed(2)}ms total, ${avg.toFixed(2)}ns avg`);
  return avg;
}

console.log('--- Benchmarking cn utility ---');

benchmark('Empty input: cn()', () => {
  cn();
});

benchmark('Single class: cn("bg-blue-500")', () => {
  cn('bg-blue-500');
});

benchmark('Single class with space: cn("bg-blue-500 text-white")', () => {
  cn('bg-blue-500 text-white');
});

benchmark('Complex merge: cn("bg-blue-500", "bg-red-500")', () => {
  cn('bg-blue-500', 'bg-red-500');
});

benchmark('Very complex: cn("px-2 py-1", ["bg-gray-800", "text-white"], { "rounded-md": true })', () => {
  cn("px-2 py-1", ["bg-gray-800", "text-white"], { "rounded-md": true });
});
