const os = require('os');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadEnv(path.join(__dirname, 'backend', '.env'));
loadEnv(path.join(__dirname, 'frontend', '.env'));

const PORT = process.env.PORT;
const HOST = process.env.HOST;
const BACKEND_PORT = process.env.BACKEND_PORT;
const BACKEND_HOST = process.env.BACKEND_HOST;

function findGunicorn() {
  if (process.env.GUNICORN_PATH && fs.existsSync(process.env.GUNICORN_PATH)) {
    return process.env.GUNICORN_PATH;
  }

  const home = os.homedir();
  const isWin = process.platform === 'win32';
  const bin = isWin ? 'Scripts' + path.sep + 'gunicorn.exe' : path.join('bin', 'gunicorn');

  if (process.env.CONDA_PREFIX) {
    const candidate = path.join(process.env.CONDA_PREFIX, bin);
    try { if (fs.existsSync(candidate)) return candidate; } catch {}
    if (!isWin) {
      try {
        const g3 = candidate.replace(/\/gunicorn$/, '/gunicorn3');
        if (fs.existsSync(g3)) return g3;
      } catch {}
    }
  }

  const condaBases = [
    path.join(home, 'miniconda3'),
    path.join(home, 'anaconda3'),
    path.join(home, 'miniforge3'),
    '/opt/miniconda3',
    '/opt/anaconda3',
    '/opt/miniforge3',
    '/usr/local/miniconda3',
    '/usr/local/anaconda3',
    '/opt/homebrew/anaconda3',
    '/opt/homebrew/miniconda3',
    '/usr/local/anaconda3',
    '/usr/local/miniconda3',
    '/var/www/miniconda3',
    '/var/www/anaconda3',
    '/var/www/miniforge3',
    'C:\\ProgramData\\miniconda3',
    'C:\\ProgramData\\anaconda3',
    'C:\\ProgramData\\miniforge3',
    path.join(home, 'AppData', 'Local', 'miniconda3'),
    path.join(home, 'AppData', 'Local', 'anaconda3'),
  ];

  for (const base of condaBases) {
    const candidate = path.join(base, 'envs', 'yaqeen', bin);
    try { if (fs.existsSync(candidate)) return candidate; } catch {}
    if (!isWin) {
      try {
        const g3 = candidate.replace(/\/gunicorn$/, '/gunicorn3');
        if (fs.existsSync(g3)) return g3;
      } catch {}
    }
  }

  const whichCmds = isWin ? ['where gunicorn'] : ['which gunicorn', 'command -v gunicorn', 'type -p gunicorn'];
  for (const cmd of whichCmds) {
    try {
      const found = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim().split('\n')[0];
      if (found && fs.existsSync(found)) return found;
    } catch {}
  }

  try {
    const found = execSync('conda run -n yaqeen which gunicorn', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim().split('\n')[0];
    if (found && fs.existsSync(found)) return found;
  } catch {}

  try {
    const found = execSync('bash -l -c "which gunicorn"', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim().split('\n')[0];
    if (found && fs.existsSync(found)) return found;
  } catch {}

  if (process.env.PATH) {
    for (const dir of process.env.PATH.split(path.delimiter)) {
      const candidate = path.join(dir, 'gunicorn');
      try { if (fs.existsSync(candidate)) return candidate; } catch {}
      if (!isWin) {
        try {
          const g3 = path.join(dir, 'gunicorn3');
          if (fs.existsSync(g3)) return g3;
        } catch {}
      }
    }
  }

  throw new Error(
    'Could not find gunicorn in the yaqeen conda environment.\n' +
    'Run: conda activate yaqeen && which gunicorn\n' +
    'Then set GUNICORN_PATH=/full/path/to/gunicorn before starting PM2.'
  );
}

module.exports = {
  apps: [
    {
      // ── Frontend: Next.js custom server ──────────────────────────
      name: 'yaqeen-frontend',
      cwd: './frontend',
      script: 'server.mjs',
      env: {
        NODE_ENV: 'production',
        PORT: PORT,
        HOST: HOST,
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '../logs/frontend-error.log',
      out_file: '../logs/frontend-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Uncomment for HTTPS:
      // env: {
      //   NODE_ENV: 'production',
      //   PORT: PORT,
      //   HOST: HOST,
      //   USE_HTTPS: 'true',
      // },
    },
    {
      // ── Backend: Django WSGI via gunicorn (conda env: yaqeen) ───
      name: 'yaqeen-backend',
      cwd: './backend',
      script: findGunicorn(),
      args: `config.wsgi:application --bind ${BACKEND_HOST}:${BACKEND_PORT} --workers 3 --timeout 120`,
      interpreter: 'none',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      error_file: '../logs/backend-error.log',
      out_file: '../logs/backend-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
