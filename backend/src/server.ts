import http from 'node:http';

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: Date.now() }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

const port = parseInt(process.env.PORT || '3000', 10);
server.listen(port, () => console.log(`Backend listening on :${port}`));
