# Systematic Debugging

## Overview

A structured, evidence-based approach to debugging that eliminates guesswork and ensures root cause identification. Part of the Superpowers framework.

## Core Principle

Debug systematically, not ad-hoc. Follow a rigorous process to identify, isolate, and resolve issues.

## The 4-Phase Debugging Process

### Phase 1: Reproduction

- Create a minimal, consistent reproduction case
- Document exact steps to trigger the issue
- Identify environmental factors
- Verify the issue is not transient

### Phase 2: Isolation

- Narrow down the failure scope
- Use binary search approach on code/changes
- Isolate variables (code, config, data, environment)
- Create minimal test case

### Phase 3: Hypothesis

- Form evidence-based hypotheses
- Consider recent changes first
- Look for patterns in errors
- Check dependencies and integrations

### Phase 4: Verification

- Test hypothesis with targeted changes
- Verify fix resolves the issue
- Ensure no regressions introduced
- Document root cause and solution

## Debugging Techniques

### Root Cause Tracing

1. Start with the symptom
2. Trace backwards through the call stack
3. Identify the first point of failure
4. Examine state at that point

### Defense in Depth

- Add logging at critical points
- Use assertions for invariants
- Implement health checks
- Monitor key metrics

### Condition-Based Waiting

- Wait for specific conditions, not arbitrary time
- Use proper synchronization primitives
- Avoid race conditions
- Test timing-sensitive code

## Evidence Collection

### Logs

- Add strategic logging before the issue
- Capture relevant state variables
- Use appropriate log levels
- Include timestamps and context

### Stack Traces

- Capture full stack traces
- Examine all frames, not just top
- Look for async/callback context
- Check for wrapped exceptions

### State Analysis

- Dump relevant object state
- Compare expected vs actual
- Check for null/undefined values
- Validate data integrity

## Common Pitfalls

- **Assumption**: Don't assume you know the cause
- **Premature fixing**: Don't fix before understanding
- **Symptom treatment**: Address root cause, not symptoms
- **Skipping reproduction**: Always reproduce first
- **Ignoring environment**: Check all variables

## Integration

Works with:

- CMZ self-heal capability
- Test-driven-development
- Code review processes
- Monitoring and alerting

## Success Metrics

- Time to root cause identification
- False fix rate (fixes that don't work)
- Regression rate (new bugs introduced)
- Documentation quality
