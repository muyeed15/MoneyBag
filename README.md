# Yaqeen

Islamic digital wallet. Django REST backend + Next.js frontend.

## Quick Start

**Backend**

```bash
cd backend
conda create -n yaqeen python=3.12.13
conda activate yaqeen
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py seed
python manage.py runserver
```

**Frontend**

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

| Service     | URL                            |
| ----------- | ------------------------------ |
| Backend API | `http://127.0.0.1:8003`        |
| Admin panel | `http://127.0.0.1:8003/admin/` |
| Frontend    | `http://127.0.0.1:3003`        |

Ports and hosts are read from each service's `.env` file — the backend runs on `8003` and the frontend on `3003` by default. No URLs or ports are hardcoded in the code.

## Production

**Build frontend**

```bash
cd frontend
npm run build
```

**Start with PM2**

Both services are managed by `ecosystem.config.js` at the project root.
Ports and hosts are read automatically from `.env` files.

```bash
mkdir -p logs
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # auto-start on server reboot
```

Manage individually:

```bash
pm2 start ecosystem.config.js --only yaqeen-backend
pm2 start ecosystem.config.js --only yaqeen-frontend
```

| Service     | URL                     | Port |
| ----------- | ----------------------- | ---- |
| Backend API | `http://127.0.0.1:8003` | 8003 |
| Frontend    | `http://127.0.0.1:3003` | 3003 |

## Further Reading

- [Backend docs](backend/README.md) - API endpoints, models, project structure
- [Frontend docs](frontend/README.md) - pages, architecture, logging
