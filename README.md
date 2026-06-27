# Yaqeen

Sharia-compliant Islamic digital wallet. Django REST backend + Next.js frontend.

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

| Service     | URL                                |
|-------------|------------------------------------|
| Backend API | `http://127.0.0.1:8000`            |
| Admin panel | `http://127.0.0.1:8000/admin/`     |
| Frontend    | `http://localhost:3000`            |

## Production

**Prerequisites**

Install `gunicorn` inside the conda environment:

```bash
conda activate yaqeen
pip install gunicorn
```

**Build frontend**

```bash
cd frontend
npm run build
```

**Start with PM2**

Both services are managed by `ecosystem.config.js` at the project root:

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

| Service         | URL                             | Port |
|-----------------|---------------------------------|------|
| Backend API     | `http://0.0.0.0:8000`           | 8000 |
| Frontend        | `http://0.0.0.0:3000`           | 3000 |

## Further Reading

- [Backend docs](backend/README.md) - API endpoints, models, project structure
- [Frontend docs](frontend/README.md) - pages, architecture, logging
