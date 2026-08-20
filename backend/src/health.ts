import http from 'node:http';

export interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: number;
  uptime: number;
  checks?: Record<string, string>;
}

const startTime = Date.now();

export function getHealthStatus(): HealthStatus {
  return {
    status: 'ok',
    timestamp: Date.now(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
  };
}

export function getReadinessStatus(): HealthStatus {
  const checks: Record<string, string> = {
    database: 'not_configured',
    ai_provider: 'not_configured',
  };

  return {
    status: 'ok',
    timestamp: Date.now(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    checks,
  };
}

export function handleHealth(_req: http.IncomingMessage, res: http.ServerResponse): void {
  const body = getHealthStatus();
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

export function handleReadiness(_req: http.IncomingMessage, res: http.ServerResponse): void {
  const body = getReadinessStatus();
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}
