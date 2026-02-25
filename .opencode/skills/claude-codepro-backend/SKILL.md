# Claude CodePro Backend Models & Standards

## Overview

Enterprise-grade backend development standards and model configurations for AI-assisted coding. Ensures consistency, reliability, and maintainability in backend systems.

## Model Standards

### Backend Task Classification

**High-Complexity Tasks**

- Architecture design
- Database schema design
- API design and implementation
- Security implementation
- Performance optimization
- Model: opencode/kimi-k2.5-free

**Medium-Complexity Tasks**

- Business logic implementation
- Data validation
- Error handling
- Logging and monitoring
- Model: opencode/glm-4.7-free

**Low-Complexity Tasks**

- Code formatting
- Simple CRUD operations
- Configuration updates
- Documentation
- Model: opencode/minimax-m2.1-free

## Backend Standards

### API Design

- RESTful principles
- Consistent naming conventions
- Versioning strategy
- Rate limiting
- Authentication/Authorization

### Database

- Schema normalization
- Index optimization
- Migration management
- Query optimization
- Connection pooling

### Security

- Input validation
- SQL injection prevention
- XSS protection
- CSRF tokens
- Secure headers

### Performance

- Caching strategies
- Async processing
- Pagination
- Compression
- CDN usage

### Code Quality

- Type safety
- Error boundaries
- Logging standards
- Testing coverage
- Documentation

## Best Practices

1. Always validate inputs at the API boundary
2. Use transactions for multi-step operations
3. Implement proper error handling with meaningful messages
4. Log strategically for debugging and monitoring
5. Write tests before or alongside implementation
6. Document APIs with OpenAPI/Swagger
7. Use environment variables for configuration
8. Implement health checks and readiness probes

## Anti-Patterns to Avoid

- Business logic in controllers
- Direct database access from frontend
- Hardcoded values
- Synchronous operations for I/O
- Missing error handling
- N+1 query problems
- Giant monolithic functions

## Integration Points

- Works with CMZ agent orchestration
- Compatible with systematic-debugging skill
- Integrates with test-driven-development workflows
