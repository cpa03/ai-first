import { redactPIIInObject } from '../src/lib/pii-redaction';

describe('redactPIIInObject performance', () => {
  it('benchmarks large TypedArray redaction', () => {
    const data = new Uint8Array(100000); // 100KB
    const start = Date.now();
    redactPIIInObject(data);
    const end = Date.now();
    console.log(`Redaction of 100KB Uint8Array took ${end - start}ms`);
  });
});
