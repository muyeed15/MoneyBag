# MoneyBag

A Mobile Financial Service (MFS) web app. Django backend + Next.js frontend.

## Quick Start

**Backend**
```bash
cd backend
conda create -n moneybag python=3.12.13
conda activate moneybag
pip install -r requirements.txt
cp env.example .env
python manage.py migrate
python manage.py runserver
```

**Frontend**
```bash
cd frontend
npm install
cp env.example .env
npm run dev
```

Backend runs at `http://127.0.0.1:8000`, frontend at `http://localhost:3000`.
