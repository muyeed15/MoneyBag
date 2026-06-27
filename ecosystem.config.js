module.exports = {
  apps: [
    {
      // ── Frontend: Next.js custom server ──────────────────────────
      name: 'yaqeen-frontend',
      cwd: './frontend',
      script: 'server.mjs',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0',
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
      //   PORT: 3000,
      //   HOST: '0.0.0.0',
      //   USE_HTTPS: 'true',
      // },
    },
    {
      // ── Backend: Django WSGI via gunicorn (conda env: yaqeen) ───
      name: 'yaqeen-backend',
      cwd: './backend',
      // Points to gunicorn inside the yaqeen conda environment.
      // Verify with:  conda activate yaqeen && which gunicorn
      // Adjust 'miniconda3' → 'anaconda3' if needed.
      script: require('os').homedir() + '/miniconda3/envs/yaqeen/bin/gunicorn',
      args: 'config.wsgi:application --bind 0.0.0.0:8000 --workers 3 --timeout 120',
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
