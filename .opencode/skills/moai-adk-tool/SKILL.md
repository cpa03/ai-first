# MOAI ADK Tool for OpenCode

## Overview

MOAI (Modular Open AI) Agent Development Kit integration for OpenCode CLI. Enables seamless tool orchestration and agent workflow management.

## Features

### Tool Orchestration

- Automatic tool discovery and registration
- Parallel tool execution
- Tool chaining and pipelining
- Error handling and recovery

### Agent Workflows

- Pre-built workflow templates
- Custom workflow creation
- Workflow visualization
- Execution monitoring

### Integration Points

- OpenCode CLI native integration
- MCP (Model Context Protocol) support
- Custom tool registration
- External service connectivity

## Usage

### Basic Tool Usage

```
opencode run tool-name --input "parameters"
```

### Workflow Execution

```
opencode run workflow-name --config workflow.json
```

### Custom Tool Registration

```json
{
  "tools": {
    "my-custom-tool": {
      "entry": "./tools/my-tool.js",
      "config": {
        "timeout": 5000
      }
    }
  }
}
```

## Configuration

### Tool Configuration

- Timeout settings
- Retry policies
- Resource limits
- Authentication

### Workflow Configuration

- Step definitions
- Dependencies
- Parallelization
- Error handling

## Best Practices

1. **Tool Granularity**: Keep tools focused and single-purpose
2. **Error Handling**: Always implement proper error handling
3. **Resource Management**: Clean up resources after use
4. **Documentation**: Document tool inputs, outputs, and side effects
5. **Testing**: Test tools in isolation before integration

## Advanced Features

### Dynamic Tool Loading

- Load tools on-demand
- Hot-reload during development
- Version management

### Workflow Optimization

- Automatic parallelization
- Dependency resolution
- Execution caching
- Progress tracking

## Integration with CMZ

- Delegates tool-heavy tasks to MOAI
- Leverages parallel execution
- Integrates with self-heal for error recovery
- Uses self-learn for tool optimization

## Troubleshooting

### Common Issues

- Tool not found: Check tool registration
- Timeout errors: Increase timeout or optimize tool
- Authentication failures: Verify credentials
- Resource exhaustion: Monitor and limit resource usage
