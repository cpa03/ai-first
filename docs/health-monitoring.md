# Health Monitoring Guide

This guide explains how to monitor the health and status of the IdeaFlow application using the built-in health check endpoints.

## Overview

The application provides three health check endpoints:

1. **GET /api/health** - Basic environment and configuration check
2. **GET /api/health/detailed** - Comprehensive system health with all services
3. **GET /api/health/database** - Database-specific health check

These endpoints are designed for:

- Load balancers (upstream health checks)
- Monitoring systems (Prometheus, Datadog, etc.)
- Operations dashboards
- Development debugging

---

## Quick Start

### Check Basic Health

```bash
curl http://localhost:3000/api/health
```

### Check Detailed Health

```bash
curl http://localhost:3000/api/health/detailed
```

### Check Database Health

```bash
curl http://localhost:3000/api/health/database
```

---

## Endpoint Details

### GET /api/health

Basic health check that validates environment configuration and required services.

**Purpose:**

- Verify environment variables are set
- Check AI provider availability
- Validate required configuration

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-07T12:00:00Z",
  "environment": "development",
  "checks": {
    "NEXT_PUBLIC_SUPABASE_URL": {
      "present": true,
      "required": true
    },
    "OPENAI_API_KEY": {
      "present": true,
      "required": false
    }
  },
  "summary": {
    "requiredVarsSet": 5,
    "totalRequiredVars": 5,
    "hasAIProvider": true,
    "environment": "development"
  }
}
```

**Status Values:**

- `healthy`: All required environment variables set
- `unhealthy`: Missing required variables
- `warning`: All required set, but no AI provider configured

**Use Cases:**

- Container startup readiness probes
- Simple "is service up?" checks
- Environment verification

---

### GET /api/health/detailed

Comprehensive health check with all services, latencies, and circuit breaker states.

**Purpose:**

- Database health and latency
- AI service availability
- Export connector status
- Circuit breaker monitoring
- Overall system status calculation

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-07T12:00:00Z",
  "version": "0.1.0",
  "uptime": 3600,
  "checks": {
    "database": {
      "status": "up",
      "latency": 45,
      "lastChecked": "2024-01-07T12:00:00Z"
    },
    "ai": {
      "status": "up",
      "latency": 234,
      "lastChecked": "2024-01-07T12:00:00Z"
    },
    "exports": {
      "status": "degraded",
      "error": "2/5 connectors",
      "lastChecked": "2024-01-07T12:00:00Z"
    },
    "circuitBreakers": [
      {
        "service": "openai",
        "state": "closed",
        "failures": 0,
        "nextAttemptTime": null
      },
      {
        "service": "trello",
        "state": "open",
        "failures": 5,
        "nextAttemptTime": "2024-01-07T12:01:00Z"
      }
    ]
  }
}
```

**Overall Status Logic:**

| Database | AI   | Exports  | Circuit Breakers Open | Overall Status |
| -------- | ---- | -------- | --------------------- | -------------- |
| up       | up   | up       | 0                     | healthy        |
| up       | up   | degraded | 0-1                   | degraded       |
| up       | up   | down     | 0-1                   | degraded       |
| down     | any  | any      | any                   | unhealthy      |
| up       | down | any      | any                   | unhealthy      |
| any      | any  | any      | 3+                    | unhealthy      |

**Status Values:**

- `healthy`: All critical services up, no circuit breakers open
- `degraded`: Some services degraded or circuit breaker open
- `unhealthy`: Critical service down or multiple circuit breakers open

**Use Cases:**

- Load balancer health checks
- Monitoring system integration
- Alerting on degraded services
- Operational dashboards

---

### GET /api/health/database

Database-specific health check.

**Purpose:**

- Test database connectivity
- Verify database operations
- Check connection pool

**Response:**

```json
{
  "status": "healthy",
  "service": "database",
  "timestamp": "2024-01-07T12:00:00Z",
  "environment": "development"
}
```

**Status Values:**

- `healthy`: Database is responsive
- `error`: Database connection failed
- `error`: Database query failed

**Use Cases:**

- Database-specific monitoring
- Database connection pool health
- Troubleshooting database issues

---

## Health Check Metrics

### System Metrics

- **status**: Overall health status (healthy/degraded/unhealthy)
- **timestamp**: ISO 8601 timestamp of check
- **version**: Application version from package.json
- **uptime**: Seconds since application started

### Database Health

- **status**: Service status (up/down/degraded)
- **latency**: Query response time in milliseconds
- **lastChecked**: Timestamp of last health check

### AI Service Health

- **status**: Service status (up/down/degraded)
- **latency**: API response time in milliseconds
- **lastChecked**: Timestamp of last health check

### Export Connectors Health

- **status**: Service status (up/down/degraded)
- **error**: Error message if degraded (e.g., "2/5 connectors")
- **lastChecked**: Timestamp of last health check

### Circuit Breaker States

- **service**: Service name (openai, notion, trello, github)
- **state**: Circuit breaker state (closed/open/half-open)
- **failures**: Number of consecutive failures
- **nextAttemptTime**: ISO timestamp of next retry attempt (if open)

---

## Circuit Breaker Monitoring

### Circuit Breaker States

**Closed (Normal)**

- Service is functioning normally
- Requests are allowed
- Failure count is 0
- **Action:** Normal operation, no intervention needed

**Open (Failing)**

- Service has exceeded failure threshold
- All requests are blocked
- **Action:** Wait for reset time, monitor external service status

**Half-Open (Testing)**

- Testing if service has recovered
- Limited requests allowed
- **Action:** Monitor, may transition to closed (recovery) or open (still failing)

### Circuit Breaker Configuration

| Service  | Fail Threshold | Reset Time | Timeout |
| -------- | -------------- | ---------- | ------- |
| OpenAI   | 5 failures     | 60 seconds | 60s     |
| Notion   | 5 failures     | 30 seconds | 30s     |
| Trello   | 3 failures     | 20 seconds | 15s     |
| GitHub   | 5 failures     | 30 seconds | 30s     |
| Supabase | 10 failures    | 60 seconds | 10s     |

### Monitoring Circuit Breakers

**Using /api/health/detailed:**

```bash
# Check all circuit breakers
curl http://localhost:3000/api/health/detailed | jq '.checks.circuitBreakers'
```

**Output:**

```json
[
  {
    "service": "openai",
    "state": "closed",
    "failures": 0
  },
  {
    "service": "trello",
    "state": "open",
    "failures": 5,
    "nextAttemptTime": "2024-01-07T12:01:00Z"
  }
]
```

**Alerting Rules:**

- Alert when any circuit breaker opens
- Alert when multiple circuit breakers open (system degraded)
- Alert when circuit breaker stays open > 5 minutes

---

## Monitoring Implementation

### Load Balancer Health Check

**Nginx Example:**

```nginx
upstream ideaflow {
    server localhost:3000 max_fails=3 fail_timeout=30s;
}

server {
    location / {
        proxy_pass http://ideaflow;
        proxy_next_upstream error timeout http_502 http_503 http_504;
    }
}
```

**Kubernetes Liveness/Readiness Probes:**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: ideaflow
spec:
  containers:
    - name: ideaflow
      image: ideaflow:latest
      ports:
        - containerPort: 3000
      livenessProbe:
        httpGet:
          path: /api/health
          port: 3000
        initialDelaySeconds: 30
        periodSeconds: 10
      readinessProbe:
        httpGet:
          path: /api/health/detailed
          port: 3000
        initialDelaySeconds: 5
        periodSeconds: 5
```

### Prometheus Monitoring

**Prometheus Exporter:**

```python
from prometheus_client import start_http_server, Gauge

def check_health():
    response = requests.get('http://localhost:3000/api/health/detailed')
    data = response.json()

    # Update gauges
    db_status_gauge.set(1 if data['checks']['database']['status'] == 'up' else 0)
    ai_latency_gauge.set(data['checks']['ai']['latency'])
    circuit_breaker_open_gauge.set(
        sum(1 for cb in data['checks']['circuitBreakers'] if cb['state'] == 'open')
    )

# Setup metrics
db_status_gauge = Gauge('ideaflow_database_up', 'Database status')
ai_latency_gauge = Gauge('ideaflow_ai_latency_ms', 'AI service latency')
circuit_breaker_open_gauge = Gauge('ideaflow_circuit_breakers_open', 'Open circuit breakers')

start_http_server(8000)
```

**Alerting Rules:**

```yaml
groups:
  - name: ideaflow_alerts
    rules:
      - alert: IdeaflowUnhealthy
        expr: up{job="ideaflow"} == 0
        for: 5m
        annotations:
          summary: 'IdeaFlow instance is unhealthy'
      - alert: IdeaflowCircuitBreakerOpen
        expr: ideaflow_circuit_breakers_open > 0
        for: 1m
        annotations:
          summary: 'Circuit breaker is open'
      - alert: IdeaflowAILatencyHigh
        expr: ideaflow_ai_latency_ms > 5000
        for: 2m
        annotations:
          summary: 'AI service latency is high'
```

### Datadog Monitoring

**Python Script:**

```python
from datadog import initialize, api

initialize(api_key='YOUR_API_KEY')

def monitor_health():
    response = requests.get('http://localhost:3000/api/health/detailed')
    data = response.json()

    # Send metrics
    api.Metric.send(
        metric='ideaflow.health.status',
        points=1 if data['status'] == 'healthy' else 0,
        tags=['env:production']
    )

    api.Metric.send(
        metric='ideaflow.database.latency',
        points=data['checks']['database']['latency'],
        tags=['service:database']
    )

    api.Metric.send(
        metric='ideaflow.ai.latency',
        points=data['checks']['ai']['latency'],
        tags=['service:openai']
    )

    # Count circuit breakers
    open_breakers = sum(1 for cb in data['checks']['circuitBreakers'] if cb['state'] == 'open')
    api.Metric.send(
        metric='ideaflow.circuit_breakers.open',
        points=open_breakers
    )
```

---

## Alerting Strategies

### Critical Alerts (Wake Someone Up)

- **System Unhealthy** - Overall status = 'unhealthy' for > 1 minute
- **Database Down** - Database status = 'down' for > 1 minute
- **AI Service Down** - AI status = 'down' for > 1 minute
- **Multiple Circuit Breakers Open** - 3+ circuit breakers open

### Warning Alerts (Investigate Next Business Hours)

- **Degraded Service** - Any service status = 'degraded' for > 5 minutes
- **High Latency** - Database latency > 500ms or AI latency > 5000ms
- **Circuit Breaker Open** - Single circuit breaker open for > 5 minutes

### Info Alerts (Monitoring Only)

- **Service Recovered** - Service transitions from down/degraded to up
- **Circuit Breaker Closed** - Circuit breaker recovers
- **Latency Spike** - Temporary latency increase

---

## Troubleshooting

### Database Issues

**Symptoms:**

- Database status = 'down'
- High latency (> 500ms)

**Checks:**

```bash
# Check database health
curl http://localhost:3000/api/health/database

# Check detailed health
curl http://localhost:3000/api/health/detailed | jq '.checks.database'
```

**Solutions:**

1. Verify Supabase connection
2. Check database credentials
3. Verify network connectivity
4. Check Supabase status page
5. Review connection pool settings

### AI Service Issues

**Symptoms:**

- AI status = 'down'
- Circuit breaker for OpenAI open
- High latency (> 5000ms)

**Checks:**

```bash
# Check detailed health
curl http://localhost:3000/api/health/detailed | jq '.checks.ai'

# Check circuit breaker
curl http://localhost:3000/api/health/detailed | jq '.checks.circuitBreakers[] | select(.service=="openai")'
```

**Solutions:**

1. Check OpenAI API key
2. Verify API quota
3. Check OpenAI status page
4. Review circuit breaker failures count
5. Wait for circuit breaker reset

### Export Connector Issues

**Symptoms:**

- Exports status = 'degraded'
- Export connector circuit breakers open

**Checks:**

```bash
# Check export health
curl http://localhost:3000/api/health/detailed | jq '.checks.exports'
```

**Solutions:**

1. Verify connector credentials
2. Check connector API status
3. Review circuit breaker state
4. Test connector manually
5. Update connector configuration

### Circuit Breaker Open

**Symptoms:**

- Circuit breaker state = 'open'
- Requests failing with 503

**Checks:**

```bash
# Check all circuit breakers
curl http://localhost:3000/api/health/detailed | jq '.checks.circuitBreakers'
```

**Solutions:**

1. Wait for reset time
2. Check external service status
3. Verify API credentials
4. Review failure count
5. Monitor for recovery

---

## Best Practices

### Monitoring Frequency

- **Production**: Poll `/api/health/detailed` every 30 seconds
- **Staging**: Poll every 60 seconds
- **Development**: Poll every 2 minutes or manual

### Alert Thresholds

- **Latency**: Alert when > 2x normal
- **Downtime**: Alert after 1 minute of unhealthy
- **Circuit Breaker**: Alert immediately on open

### Data Retention

- Store health check results for 30 days
- Track historical latency trends
- Correlate with application metrics

### Notification Channels

- **Critical**: PagerDuty, SMS, phone call
- **Warning**: Slack, email, Microsoft Teams
- **Info**: Dashboard annotations only

---

## Sample Monitoring Dashboard

### Grafana Panel Queries

**Overall System Status:**

```promql
vector(1) * on() label_transform(
  up{job="ideaflow"},
  "status",
  "healthy"
)
```

**Database Latency:**

```promql
rate(ideaflow_database_latency_ms[5m])
```

**AI Service Latency:**

```promql
rate(ideaflow_ai_latency_ms[5m])
```

**Open Circuit Breakers:**

```promql
sum by (service) (ideaflow_circuit_breaker_open == 1)
```

**System Uptime:**

```promql
avg_over_time(up{job="ideaflow"}[30d])
```

---

## Related Documentation

- [API Reference](./api.md) - All API endpoints
- [Error Code Reference](./error-codes.md) - Error handling
- [Architecture](./architecture.md) - System design
- [Integration Hardening](./integration-hardening.md) - Resilience patterns
