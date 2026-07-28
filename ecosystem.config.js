const os = require('os');
const path = require('path');
const fs = require('fs');

function findGunicorn() {
  const home = os.homedir();
  const isWin = process.platform === 'win32';
  const bin = isWin ? 'Scripts' + path.sep + 'gunicorn.exe' : path.join('bin', 'gunicorn');

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
    'C:\\ProgramData\\miniconda3',
    'C:\\ProgramData\\anaconda3',
    'C:\\ProgramData\\miniforge3',
    path.join(home, 'AppData', 'Local', 'miniconda3'),
    path.join(home, 'AppData', 'Local', 'anaconda3'),
  ];

  for (const base of condaBases) {
    const candidate = path.join(base, 'envs', 'yaqeen', bin);
    try {
      if (fs.existsSync(candidate)) return candidate;
    } catch {}
    if (!isWin) {
      try {
        const g3 = candidate.replace(/\/gunicorn$/, '/gunicorn3');
        if (fs.existsSync(g3)) return g3;
      } catch {}
    }
  }

  return isWin ? 'gunicorn' : 'gunicorn3';
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
        PORT: 3003,
        HOST: '127.0.0.1',
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
      //   PORT: 3003,
      //   HOST: '127.0.0.1',
      //   USE_HTTPS: 'true',
      // },
    },
    {
      // ── Backend: Django WSGI via gunicorn (conda env: yaqeen) ───
      name: 'yaqeen-backend',
      cwd: './backend',
      script: findGunicorn(),
      args: 'config.wsgi:application --bind 127.0.0.1:8003 --workers 3 --timeout 120',
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
