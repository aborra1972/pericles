import http from 'node:http';
import { config } from './config.js';
import { handleHealth, handleReadiness } from './health.js';

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    handleHealth(req, res);
  } else if (req.url === '/health/ready') {
    handleReadiness(req, res);
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(config.port, () => {
  console.log(`Pericles backend listening on :${config.port} [${config.nodeEnv}]`);
});
