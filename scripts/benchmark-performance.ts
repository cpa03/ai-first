
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Original Implementations ---

function originalConversion(array: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < array.length; i++) {
    binary += String.fromCharCode(array[i]);
  }
  return binary;
}

function originalCn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Optimized Implementations ---

function optimizedConversion(array: Uint8Array): string {
  // Unrolled indexing for 16-byte buffer is ~3x faster than loop
  return String.fromCharCode(
    array[0], array[1], array[2], array[3],
    array[4], array[5], array[6], array[7],
    array[8], array[9], array[10], array[11],
    array[12], array[13], array[14], array[15]
  );
}

function optimizedCn(...inputs: ClassValue[]) {
  // PERFORMANCE: Fast-path for common empty or single-class cases
  if (inputs.length === 0) return '';
  if (inputs.length === 1 && typeof inputs[0] === 'string' && !inputs[0].includes(' ')) {
    return inputs[0];
  }
  return twMerge(clsx(inputs));
}

// --- Benchmarking Logic ---

function benchmark(name: string, fn: () => void, iterations: number = 1000000) {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const end = performance.now();
  const duration = end - start;
  console.log(`${name}: ${duration.toFixed(2)}ms (${(duration / iterations * 1000).toFixed(4)}ns per op)`);
  return duration;
}

const testArray = new Uint8Array(16);
for (let i = 0; i < 16; i++) testArray[i] = Math.floor(Math.random() * 256);

console.log('--- Benchmarking 16-byte Conversion (10,000,000 iterations) ---');
const t1 = benchmark('Original loop conversion', () => originalConversion(testArray), 10000000);
const t2 = benchmark('Optimized unrolled conversion', () => optimizedConversion(testArray), 10000000);
console.log(`Speedup: ${(t1 / t2).toFixed(2)}x`);

console.log('\n--- Benchmarking cn() - Empty Input (10,000,000 iterations) ---');
const t3 = benchmark('Original cn()', () => originalCn(), 10000000);
const t4 = benchmark('Optimized cn()', () => optimizedCn(), 10000000);
console.log(`Speedup: ${(t3 / t4).toFixed(2)}x`);

console.log('\n--- Benchmarking cn() - Single Class (10,000,000 iterations) ---');
const t5 = benchmark('Original cn()', () => originalCn('bg-blue-500'), 10000000);
const t6 = benchmark('Optimized cn()', () => optimizedCn('bg-blue-500'), 10000000);
console.log(`Speedup: ${(t5 / t6).toFixed(2)}x`);

console.log('\n--- Benchmarking cn() - Multiple Classes (1,000,000 iterations) ---');
const t7 = benchmark('Original cn()', () => originalCn('bg-blue-500', 'p-4', 'text-white'), 1000000);
const t8 = benchmark('Optimized cn()', () => optimizedCn('bg-blue-500', 'p-4', 'text-white'), 1000000);
console.log(`Speedup: ${(t7 / t8).toFixed(2)}x`);
