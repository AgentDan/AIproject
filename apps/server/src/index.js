import { createApp } from './app.js';
import { runtimeLabel } from './config/runtime.js';

const port = Number(process.env.PORT) || 3001;
/** In containers and PaaS, bind all interfaces so the port is reachable from outside localhost. */
const host = process.env.HOST || '0.0.0.0';

const server = createApp();

server.listen(port, host, () => {
  console.log(
    `[${runtimeLabel()}] Server is running on http://${host}:${port}`
  );
});
