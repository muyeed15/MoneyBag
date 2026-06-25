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
