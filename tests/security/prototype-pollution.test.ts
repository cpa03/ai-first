import { redactPIIInObject } from '@/lib/pii-redaction';

describe('PII Redaction Prototype Pollution Defense', () => {
  it('should not allow prototype pollution via __proto__', () => {
    const malicious = JSON.parse('{"__proto__": {"polluted": true}}');
    const redacted = redactPIIInObject(malicious) as any;

    // The redacted object itself should not have the polluted property on its prototype
    // (though in modern JS, setting __proto__ on a literal usually works,
    // we want to ensure we don't copy/process it)
    expect(({} as any).polluted).toBeUndefined();
    expect(redacted.polluted).toBeUndefined();

    // In our implementation, we want to ensure __proto__ is NOT copied to the new object
    expect(Object.getOwnPropertyNames(redacted)).not.toContain('__proto__');
  });

  it('should not allow prototype pollution via constructor.prototype', () => {
    const malicious = JSON.parse('{"constructor": {"prototype": {"polluted": true}}}');
    const redacted = redactPIIInObject(malicious) as any;

    expect(({} as any).polluted).toBeUndefined();
    expect(Object.getOwnPropertyNames(redacted)).not.toContain('constructor');
  });
});
