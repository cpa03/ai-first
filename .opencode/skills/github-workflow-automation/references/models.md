# OpenCode Free Models

OpenCode provides free AI models optimized for code-related tasks in GitHub Actions.

---

## Available Free Models

### 1. opencode/kimi-k2.5-free
**Best for:** General-purpose tasks, fast response

```yaml
--model opencode/kimi-k2.5-free
```

**Characteristics:**
- Fast response time
- Good at code understanding
- Suitable for most automation tasks
- Balanced capabilities

**Use Cases:**
- General code analysis
- Simple bug fixes
- Comment generation
- Code review summaries
- Documentation generation

---

### 2. opencode/glm-4.7-free
**Best for:** Logic-heavy tasks, complex problem solving

```yaml
--model opencode/glm-4.7-free
```

**Characteristics:**
- Strong logical reasoning
- Chinese language optimization
- Handles complex algorithms
- Better for multi-step planning

**Use Cases:**
- Complex bug fixes
- Algorithm optimization
- Architectural decisions
- Multi-phase refactoring
- Logic-intensive automation

---

### 3. opencode/minimax-m2.1-free
**Best for:** Multimodal tasks, visual understanding

```yaml
--model opencode/minimax-m2.1-free
```

**Characteristics:**
- Multimodal capabilities
- Can process images
- Visual understanding
- Good at diagram interpretation

**Use Cases:**
- Code with diagrams
- Visual documentation
- UI automation
- Image-based code generation
- Screenshot-based workflows

---

## Model Selection Guide

### Decision Flow

```
Start
  │
  ├─ Needs visual/diagram understanding?
  │  └─ Yes → minimax-m2.1-free
  │
  ├─ Complex logic/multi-step process?
  │  └─ Yes → glm-4.7-free
  │
  └─ General code task?
     └─ Yes → kimi-k2.5-free
```

### Task-to-Model Mapping

| Task Type | Recommended Model | Reason |
|-----------|-------------------|--------|
| Simple comment analysis | kimi-k2.5-free | Fast, sufficient |
| Code review | kimi-k2.5-free | Quick turnaround |
| Bug fix (simple) | kimi-k2.5-free | Efficient |
| Bug fix (complex) | glm-4.7-free | Better reasoning |
| Feature implementation | glm-4.7-free | Multi-step planning |
| Refactoring | kimi-k2.5-free | General code understanding |
| Algorithm optimization | glm-4.7-free | Strong logic |
| Documentation gen | kimi-k2.5-free | Good text generation |
| CI/CD troubleshooting | kimi-k2.5-free | Quick analysis |
| Issue parsing | kimi-k2.5-free | Fast text processing |
| Test generation | kimi-k2.5-free | Standard patterns |
| Schema design | glm-4.7-free | Complex relationships |
| Architecture review | glm-4.7-free | High-level reasoning |
| UI/UX code | minimax-m2.1-free | Visual context |
| Diagram-to-code | minimax-m2.1-free | Multimodal |

---

## Usage Patterns

### Basic Usage
```yaml
- name: Run OpenCode
  run: |
    opencode run "Your prompt here" \
      --model opencode/kimi-k2.5-free
```

### Model-Specific Tasks
```yaml
- name: Analyze Code (Fast)
  run: |
    opencode run "Analyze code quality" \
      --model opencode/kimi-k2.5-free

- name: Complex Refactor (Logic Heavy)
  run: |
    opencode run "Refactor this complex algorithm" \
      --model opencode/glm-4.7-free

- name: Generate from Diagram (Visual)
  run: |
    opencode run "Generate code from this diagram" \
      --model opencode/minimax-m2.1-free
```

### Multi-Model Workflow
```yaml
- name: Quick Scan
  run: |
    SCAN=$(opencode run "Quick scan for issues" \
      --model opencode/kimi-k2.5-free \
      --output json)

- name: Deep Analysis
  if: contains(SCAN, 'ISSUE_FOUND')
  run: |
    opencode run "Deep analysis of the issue" \
      --model opencode/glm-4.7-free
```

---

## Performance Characteristics

### Response Time
| Model | Speed | Notes |
|-------|-------|-------|
| kimi-k2.5-free | 🟢 Fast | Quick for simple tasks |
| glm-4.7-free | 🟡 Medium | Slower but more detailed |
| minimax-m2.1-free | 🟡 Medium | Depends on visual content |

### Token Usage
| Model | Input | Output |
|-------|-------|--------|
| kimi-k2.5-free | Standard | Standard |
| glm-4.7-free | Higher | Higher |
| minimax-m2.1-free | Higher (visual) | Variable |

### Cost
All models listed here are **FREE** for GitHub Actions use when integrated properly with OpenCode.

---

## Best Practices

### 1. Start with kimi-k2.5-free
For most tasks, the default model is sufficient:
```yaml
--model opencode/kimi-k2.5-free
```

### 2. Upgrade to glm-4.7-free for Complexity
When dealing with:
- Complex algorithms
- Multi-phase processes
- Architectural changes

```yaml
--model opencode/glm-4.7-free
```

### 3. Use minimax-m2.1-free for Visual Tasks
When the prompt includes:
- Diagrams
- Screenshots
- UI mockups
- Images

```yaml
--model opencode/minimax-m2.1-free
```

### 4. Model Comparison
If unsure, test with multiple models:

```yaml
- name: Compare Models
  run: |
    echo "Testing both models..."
    RESULT_FAST=$(opencode run "..." --model opencode/kimi-k2.5-free)
    RESULT_DEEP=$(opencode run "..." --model opencode/glm-4.7-free)
    echo "Compare results"
```

### 5. Timeout Considerations
- **kimi-k2.5-free**: Lower timeouts acceptable (10-20 min)
- **glm-4.7-free**: Higher timeouts recommended (20-60 min)
- **minimax-m2.1-free**: Variable (20-40 min)

```yaml
jobs:
  task:
    runs-on: ubuntu-24.04-arm
    timeout-minutes: 60  # Default for glm-4.7-free
```

---

## Model-Specific Prompting

### For kimi-k2.5-free
Keep prompts concise and direct:
```yaml
opencode run "$(cat <<'PROMPT'
  Quick task: Fix this bug.
  File: src/example.ts
  Line: 42-50
PROMPT
)" --model opencode/kimi-k2.5-free
```

### For glm-4.7-free
Provide detailed context and reasoning requirements:
```yaml
opencode run "$(cat <<'PROMPT'
  Complex task: Refactor this monolithic function into modular components.

  Requirements:
  1. Maintain backward compatibility
  2. Improve testability
  3. Add comprehensive error handling
  4. Update documentation

  Analyze current implementation, plan refactoring, implement changes, and test.
PROMPT
)" --model opencode/glm-4.7-free
```

### For minimax-m2.1-free
Include visual context or diagram references:
```yaml
opencode run "$(cat <<'PROMPT'
  Generate code from architecture diagram.

  Diagram: docs/architecture-v2.png
  Context: Show the component relationships
  Task: Implement the components as shown

  Pay attention to:
  - Component boundaries
  - Data flow direction
  - Service dependencies
PROMPT
)" --model opencode/minimax-m2.1-free
```

---

## Troubleshooting

### Model Not Responding
**Issue:** No response from model

**Solutions:**
1. Check API key configuration
2. Verify model name is correct
3. Try kimi-k2.5-free (most stable)

### Slow Response
**Issue:** Response takes too long

**Solutions:**
1. Switch to kimi-k2.5-free for speed
2. Break down complex prompts
3. Use shorter context

### Poor Quality Output
**Issue:** Output doesn't meet expectations

**Solutions:**
1. Provide more specific prompts
2. Switch to glm-4.7-free for complex tasks
3. Include more context in prompt

### Multimodal Processing Failed
**Issue:** Image/diagram not understood

**Solutions:**
1. Ensure image path is accessible
2. Use minimax-m2.1-free explicitly
3. Provide text description as fallback

---

## Reference Migration

### From Other Models
If you were using paid models, switch to free equivalents:

| Paid Model | Free Equivalent |
|------------|-----------------|
| claude-3-opus | glm-4.7-free |
| claude-3-sonnet | kimi-k2.5-free |
| gpt-4 | glm-4.7-free |
| gpt-3.5-turbo | kimi-k2.5-free |

### Example Migration
**Before:**
```yaml
opencode run "..." --model claude-3-opus
```

**After:**
```yaml
opencode run "..." --model opencode/glm-4.7-free
```

---

## Summary

- **kimi-k2.5-free**: Quick, general tasks
- **glm-4.7-free**: Complex logic, planning
- **minimax-m2.1-free**: Visual, multimodal

**Default choice:** `opencode/kimi-k2.5-free`

**Upgrade criteria:** Increase complexity → switch model up.

Use the right model for the right task to optimize efficiency and cost.