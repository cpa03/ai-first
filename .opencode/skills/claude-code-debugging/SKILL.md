# Claude Code Debugging Strategies

## Overview

Comprehensive debugging strategies optimized for AI-assisted development. Combines systematic approaches with AI-specific techniques for efficient problem resolution.

## Strategy 1: Binary Search Debugging

When facing unknown issues, use binary search on:

- Git history (bisect)
- Code changes
- Configuration changes
- Dependencies

### Process

1. Identify a known good state
2. Identify the current bad state
3. Test the midpoint
4. Narrow down based on results
5. Repeat until root cause found

## Strategy 2: Rubber Duck Debugging (AI Enhanced)

Explain the problem to the AI in detail:

1. Describe what you expected to happen
2. Describe what actually happened
3. Explain your assumptions
4. Walk through the code line by line

The act of explaining often reveals the issue.

## Strategy 3: Change One Thing at a Time

- Isolate variables
- Make one change
- Test the result
- Document the outcome
- Proceed systematically

## Strategy 4: Assume Nothing

- Verify all assumptions
- Check the obvious first
- Don't trust your memory
- Re-read error messages carefully
- Check spelling and syntax

## Strategy 5: Divide and Conquer

Break the problem into smaller parts:

1. Identify independent components
2. Test each in isolation
3. Identify which component fails
4. Focus debugging efforts there

## Strategy 6: Logging and Tracing

Add strategic logging at:

- Function entry/exit
- Before/after external calls
- State changes
- Decision points
- Error handling

## Strategy 7: Reproduction First

Never debug without reproduction:

1. Create minimal test case
2. Document exact steps
3. Verify it fails consistently
4. Use this to verify fixes

## Strategy 8: Check the Environment

Verify:

- Correct file being edited
- Server is running correct version
- Environment variables are set
- Dependencies are correct versions
- No caching issues

## Strategy 9: Read the Error Message

Completely and carefully:

- Full stack trace
- Error type and message
- File and line number
- Context around the error
- Related warnings

## Strategy 10: Use the Right Tools

- Debugger with breakpoints
- Logging frameworks
- Profiling tools
- Network inspectors
- Database query analyzers

## AI-Specific Strategies

### Leverage AI Capabilities

1. Ask AI to explain error messages
2. Request code review for suspicious sections
3. Have AI generate test cases
4. Use AI to search for similar issues
5. Ask for alternative implementations

### AI Debugging Prompts

```
"Explain this error message: [paste error]"

"Review this code for potential bugs: [paste code]"

"What could cause this behavior: [describe behavior]"

"Generate test cases for this function: [paste function]"

"Compare these two implementations: [paste both]"
```

## Common Bug Patterns

### Off-by-One Errors

- Check loop bounds
- Verify array indexing
- Check range conditions

### Null/Undefined Issues

- Check for null before use
- Validate function returns
- Initialize variables properly

### Async/Callback Issues

- Check for missing awaits
- Verify callback execution
- Handle promise rejections

### Type Issues

- Verify type conversions
- Check for implicit conversions
- Validate function signatures

### State Management

- Check for race conditions
- Verify state transitions
- Look for side effects

## Integration with CMZ

- **Self-Heal**: Apply strategies automatically
- **Self-Learn**: Remember which strategies work
- **Systematic Debugging**: Follow rigorous process
- **Parallel Analysis**: Try multiple strategies simultaneously

## Debugging Checklist

- [ ] Reproduce the issue consistently
- [ ] Read error message completely
- [ ] Check recent changes
- [ ] Verify environment setup
- [ ] Add strategic logging
- [ ] Isolate the problem area
- [ ] Form hypothesis
- [ ] Test hypothesis
- [ ] Verify fix works
- [ ] Check for regressions
