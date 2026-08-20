import http from 'node:http';
import { config } from './config.js';

const startTime = Date.now();

function healthResponse(status: string, checks?: Record<string, string>) {
  const body: Record<string, unknown> = {
    status,
    timestamp: Date.now(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
  };
  if (checks) body.checks = checks;
  return JSON.stringify(body);
}

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(healthResponse('ok'));
  } else if (req.url === '/health/ready') {
    // TODO: add database check when ADR-04 memory is implemented
    const checks = { database: 'not_configured', ai_provider: 'not_configured' };
    const status = 'ok';
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(healthResponse(status, checks));
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(config.port, () => {
  console.log(`Pericles backend listening on :${config.port} [${config.nodeEnv}]`);
});
