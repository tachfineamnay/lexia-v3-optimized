# Coolify Monitoring & Logging Configuration

## 📊 Monitoring Configuration

### Application Metrics
- **CPU Usage**: Target < 80% avg
- **Memory Usage**: Target < 85% avg  
- **Response Time**: Target < 2s avg
- **Uptime**: Target > 99.5%

### Custom Metrics Endpoints
```
GET /api/health           # Basic health check
GET /api/health/detailed  # Detailed system metrics
GET /api/metrics          # Prometheus metrics (if enabled)
```

### Health Check Thresholds
```yaml
health_checks:
  backend:
    url: "/api/health"
    interval: 30s
    timeout: 10s
    healthy_threshold: 2
    unhealthy_threshold: 3
    
  frontend:
    url: "/health.txt"
    interval: 30s
    timeout: 5s
    healthy_threshold: 2
    unhealthy_threshold: 3
```

## 📝 Logging Configuration

### Log Levels
- **Production**: `info` level minimum
- **Development**: `debug` level
- **Error Tracking**: All `error` and `warn` levels

### Log Rotation
```
Max file size: 100MB
Max files: 10
Compression: gzip
Retention: 30 days
```

### Structured Logging Format
```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "level": "info",
  "service": "backend",
  "message": "Request processed",
  "metadata": {
    "requestId": "req-123",
    "userId": "user-456",
    "duration": 150,
    "endpoint": "/api/ai/suggest"
  }
}
```

## 🚨 Alerting Rules

### Critical Alerts
- Service down > 2 minutes
- Error rate > 5% over 5 minutes
- Response time > 5s over 2 minutes
- Memory usage > 95% over 1 minute

### Warning Alerts  
- CPU usage > 80% over 5 minutes
- Memory usage > 85% over 5 minutes
- Disk usage > 85%
- Response time > 2s over 5 minutes

### Business Logic Alerts
- AI API failures > 10% over 5 minutes
- Database connection failures
- Authentication failures > 50 in 1 minute
- File upload failures > 20% over 5 minutes

## 📈 Dashboard Widgets

### System Overview
1. Service status indicators
2. Request rate (requests/minute)
3. Error rate percentage
4. Average response time

### Resource Usage
1. CPU utilization graph
2. Memory usage graph  
3. Disk I/O metrics
4. Network traffic

### Application Metrics
1. Active users count
2. AI requests per hour
3. Document uploads per day
4. VAE generations completed

### Database Metrics
1. Connection pool status
2. Query performance
3. Collection sizes
4. Index usage

## 🔧 Coolify Integration

### Environment Variables for Monitoring
```env
# Logging
LOG_LEVEL=info
LOG_FORMAT=json
LOG_MAX_SIZE=100m
LOG_MAX_FILES=10

# Monitoring  
METRICS_ENABLED=true
HEALTH_CHECK_INTERVAL=30
PERFORMANCE_MONITORING=true

# Alerting (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
EMAIL_ALERTS=admin@yourdomain.com
```

### Coolify Configuration
```json
{
  "monitoring": {
    "enabled": true,
    "retention_days": 30,
    "disk_threshold": 85,
    "memory_threshold": 85,
    "cpu_threshold": 80
  },
  "logging": {
    "level": "info",
    "format": "json",
    "max_size": "100MB",
    "rotate": true
  },
  "alerts": {
    "email": ["admin@yourdomain.com"],
    "webhook": "https://your-webhook-url.com"
  }
}
```

## 🎛️ Custom Monitoring Setup

### Prometheus Metrics (Optional)
If you want to integrate with Prometheus:

1. Add to backend/package.json:
```json
"prom-client": "^14.2.0"
```

2. Add metrics endpoint in backend/routes/metrics.js:
```javascript
const client = require('prom-client');
const register = new client.Registry();

// Custom metrics
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['route', 'method', 'status_code']
});

const aiRequestCounter = new client.Counter({
  name: 'ai_requests_total',
  help: 'Total number of AI requests',
  labelNames: ['service', 'status']
});

register.registerMetric(httpRequestDuration);
register.registerMetric(aiRequestCounter);

router.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

### Log Analysis Queries
Common queries for log analysis:

```bash
# Error rate last hour
grep "error\|ERROR" /var/log/lexia/*.log | wc -l

# Slow requests (>2s)
grep '"duration":[2-9][0-9][0-9][0-9]' /var/log/lexia/backend.log

# AI service usage
grep '"endpoint":"/api/ai/' /var/log/lexia/backend.log | wc -l

# User activity
grep '"userId":"' /var/log/lexia/backend.log | cut -d'"' -f8 | sort | uniq -c
```

## 🔍 Troubleshooting Monitoring

### Common Issues

1. **Missing Metrics**
   - Check LOG_LEVEL environment variable
   - Verify logging configuration
   - Restart services if needed

2. **Alert Fatigue**
   - Adjust thresholds based on normal patterns
   - Implement alert grouping
   - Set up maintenance windows

3. **Performance Impact**
   - Monitor the monitoring overhead
   - Adjust collection intervals
   - Use sampling for high-volume metrics

### Useful Commands
```bash
# Check log file sizes
du -sh /var/log/lexia/*

# Monitor real-time logs
docker logs -f lexia-backend | grep ERROR

# Check system resources
docker stats lexia-backend lexia-frontend lexia-mongodb

# Health check all services
curl -s http://localhost:5000/api/health | jq .
```