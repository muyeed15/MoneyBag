import { readFileSync, existsSync } from 'fs';
import { spawn } from 'child_process';

function loadEnv(filePath) {
  const env = {};
  if (!existsSync(filePath)) return env;
  for (const line of readFileSync(filePath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
  }
  return env;
}

const env = loadEnv('.env');
const port = env.PORT ?? '3003';
const host = env.HOST ?? '127.0.0.1';

const args = ['next', 'dev', '-p', port];
if (host) args.push('-H', host);

const child = spawn('npx', args, { stdio: 'inherit', shell: process.platform === 'win32' });
child.on('exit', (code) => process.exit(code ?? 0));
