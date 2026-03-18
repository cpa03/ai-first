import { cn } from '../src/lib/utils';
import { performance } from 'perf_hooks';

function benchmark(name: string, fn: () => void, iterations = 1000000) {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const end = performance.now();
  console.log(`${name}: ${((end - start) / iterations * 1000).toFixed(4)} ns/op`);
}

console.log('--- Baseline Benchmarks ---');

benchmark('cn empty', () => {
  cn();
});

benchmark('cn single class', () => {
  cn('px-4');
});

benchmark('cn two classes', () => {
  cn('px-4', 'py-2');
});

benchmark('cn conflicting classes', () => {
  cn('px-4', 'px-8');
});

benchmark('cn complex', () => {
  cn('px-4', 'py-2', { 'bg-blue-500': true, 'text-white': false }, ['m-2', 'p-1']);
});
