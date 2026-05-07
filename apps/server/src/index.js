import http from 'node:http';

const port = process.env.PORT || 3001;

const server = http.createServer((request, response) => {
  if (request.url === '/health') {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end('AI Product Scene Platform server is running.');
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
