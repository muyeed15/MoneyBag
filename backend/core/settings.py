import os
from datetime import timedelta
from pathlib import Path

from django.urls import reverse_lazy

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get("SECRET_KEY", "django-insecure-changeme")
DEBUG = os.environ.get("DEBUG", "True") == "True"
ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")

INSTALLED_APPS = [
    "unfold",
    "unfold.contrib.filters",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    "moneybag",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.middleware.gzip.GZipMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "core.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "core.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ.get("DB_NAME", "moneybag_db"),
        "USER": os.environ.get("DB_USER", "postgres"),
        "PASSWORD": os.environ.get("DB_PASSWORD", ""),
        "HOST": os.environ.get("DB_HOST", "localhost"),
        "PORT": os.environ.get("DB_PORT", "5432"),
        "CONN_MAX_AGE": int(os.environ.get("DB_CONN_MAX_AGE", 60)),
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"
    },
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Dhaka"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STORAGES = {
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

AUTH_USER_MODEL = "moneybag.User"

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_RENDERER_CLASSES": ("rest_framework.renderers.JSONRenderer",),
    "DEFAULT_PARSER_CLASSES": ("rest_framework.parsers.JSONParser",),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(
        minutes=int(os.environ.get("ACCESS_TOKEN_MINUTES", 30))
    ),
    "REFRESH_TOKEN_LIFETIME": timedelta(
        minutes=int(os.environ.get("REFRESH_TOKEN_MINUTES", 30))
    ),
}

TRANSFER_FEE_PERCENT = float(os.environ.get("TRANSFER_FEE_PERCENT", 1.5))
PAGE_SIZE = int(os.environ.get("PAGE_SIZE", 10))
PAGE_SIZE_MAX = int(os.environ.get("PAGE_SIZE_MAX", 50))

UNFOLD = {
    "SITE_TITLE": "MoneyBag",
    "SITE_HEADER": "MoneyBag Admin",
    "SITE_URL": "/",
    "DASHBOARD_CALLBACK": "moneybag.admin.dashboard.dashboard_callback",
    "COLORS": {
        "primary": {
            "50": "240 248 255",
            "100": "219 235 245",
            "200": "183 212 232",
            "300": "136 180 210",
            "400": "86 140 180",
            "500": "48 71 94",
            "600": "38 57 76",
            "700": "29 44 59",
            "800": "20 31 43",
            "900": "13 21 29",
            "950": "7 12 17",
        },
    },
    "SIDEBAR": {
        "show_search": True,
        "show_all_applications": False,
        "navigation": [
            {
                "title": "Overview",
                "separator": True,
                "items": [
                    {
                        "title": "Dashboard",
                        "icon": "dashboard",
                        "link": reverse_lazy("admin:index"),
                    },
                ],
            },
            {
                "title": "Users & Wallets",
                "separator": True,
                "items": [
                    {
                        "title": "Users",
                        "icon": "person",
                        "link": reverse_lazy("admin:moneybag_user_changelist"),
                    },
                    {
                        "title": "Wallets",
                        "icon": "account_balance_wallet",
                        "link": reverse_lazy("admin:moneybag_wallet_changelist"),
                    },
                    {
                        "title": "Cards",
                        "icon": "credit_card",
                        "link": reverse_lazy("admin:moneybag_card_changelist"),
                    },
                ],
            },
            {
                "title": "Finance",
                "separator": True,
                "items": [
                    {
                        "title": "Transactions",
                        "icon": "receipt_long",
                        "link": reverse_lazy("admin:moneybag_transaction_changelist"),
                    },
                    {
                        "title": "Merchants",
                        "icon": "store",
                        "link": reverse_lazy("admin:moneybag_merchant_changelist"),
                    },
                ],
            },
            {
                "title": "Communication",
                "separator": True,
                "items": [
                    {
                        "title": "Notifications",
                        "icon": "notifications",
                        "link": reverse_lazy("admin:moneybag_notification_changelist"),
                    },
                ],
            },
        ],
    },
}
