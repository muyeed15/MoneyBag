import { createServer } from 'http';
import { createServer as createHttpsServer } from 'https';
import { readFileSync, existsSync } from 'fs';
import next from 'next';

const PORT = process.env.PORT;
const HOST = process.env.HOST;
const USE_HTTPS = process.env.USE_HTTPS === 'true';
const dev = process.env.NODE_ENV !== 'production';

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  if (USE_HTTPS) {
    const sslDir = new URL('certificates', import.meta.url).pathname;
    if (!existsSync(`${sslDir}/localhost-key.pem`) || !existsSync(`${sslDir}/localhost.pem`)) {
      console.error('SSL certificates not found in certificates/ directory');
      process.exit(1);
    }
    const httpsOptions = {
      key: readFileSync(`${sslDir}/localhost-key.pem`),
      cert: readFileSync(`${sslDir}/localhost.pem`),
    };
    createHttpsServer(httpsOptions, (req, res) => {
      handle(req, res);
    }).listen(PORT, HOST, () => {
      console.log(`> Ready on https://${HOST}:${PORT}`);
    });
  } else {
    createServer((req, res) => {
      handle(req, res);
    }).listen(PORT, HOST, () => {
      console.log(`> Ready on http://${HOST}:${PORT}`);
    });
  }
});
