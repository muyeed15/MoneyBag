import { createServer } from 'https';
import { readFileSync } from 'fs';
import next from 'next';

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const dev = process.env.NODE_ENV !== 'production';

const app = next({ dev });
const handle = app.getRequestHandler();

const sslDir = new URL('certificates', import.meta.url).pathname;

const httpsOptions = {
  key: readFileSync(`${sslDir}/localhost-key.pem`),
  cert: readFileSync(`${sslDir}/localhost.pem`),
};

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    handle(req, res);
  }).listen(PORT, HOST, () => {
    console.log(`> Ready on https://${HOST}:${PORT}`);
  });
});
