import os
import cloudinary
from datetime import timedelta
from pathlib import Path
import dj_database_url
from dotenv import load_dotenv
from corsheaders.defaults import default_headers
from celery.schedules import crontab
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env", override=True)


SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "change-me-in-production")
DEBUG = os.getenv("DJANGO_DEBUG", "False").lower() == "true"
ALLOWED_HOSTS = [
    host.strip()
    for host in os.getenv("DJANGO_ALLOWED_HOSTS", "127.0.0.1,localhost,192.168.0.114,testserver,nxsocial.nxsys.in").split(",")
    if host.strip()
]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "core",
    "billing",
    "django_extensions",
    "django_celery_results",
    "django_celery_beat",
    "drf_spectacular",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "core.middleware.SecurityHeadersMiddleware",
    "core.middleware.RequestIDMiddleware",
]
ROOT_URLCONF = "hub.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
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

WSGI_APPLICATION = "hub.wsgi.application"
ASGI_APPLICATION = "hub.asgi.application"

DATABASES = {
    "default": dj_database_url.config(
        default=os.getenv("DATABASE_URL"),
        conn_max_age=600,
        # Neon (serverless Postgres) recycles idle connections, so a pooled
        # connection Django reuses can already be dead -> "SSL connection has
        # been closed unexpectedly". Health checks make Django validate and
        # transparently reconnect a stale connection at the start of a request.
        conn_health_checks=True,
    )
}

# Statement timeout is applied via the connection_created signal in core/apps.py
# (cannot use OPTIONS startup params with Neon's PgBouncer pooler).
DB_STATEMENT_TIMEOUT_MS = int(os.getenv("DB_STATEMENT_TIMEOUT_MS", "30000"))


# ── Cache: Redis ──────────────────────────────────────────────────────────────
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": os.getenv("REDIS_CACHE_URL", "redis://127.0.0.1:6379/1"),
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            "SOCKET_CONNECT_TIMEOUT": 5,
            "SOCKET_TIMEOUT": 5,
            # Don't crash the request if Redis is temporarily down
            "IGNORE_EXCEPTIONS": True,
        },
        "KEY_PREFIX": "nxsocial",
        "TIMEOUT": 300,  # 5 minutes default TTL
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = os.getenv("DJANGO_TIME_ZONE", "Asia/Kolkata")
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

STATIC_ROOT.mkdir(exist_ok=True)
MEDIA_ROOT.mkdir(exist_ok=True)

DATA_UPLOAD_MAX_MEMORY_SIZE = 100 * 1024 * 1024  # 100 MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 100 * 1024 * 1024  # 100 MB

STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "core.authentication.CookieJWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "200/hour",
        "user": "2000/hour",
        "login": "10/minute",
        "register": "5/hour",
        "token_refresh": "30/minute",
        "social_connect": "20/hour",
        "post_create": "50/hour",
        "password_reset": "5/hour",
    },
    "DEFAULT_PAGINATION_CLASS": "core.pagination.StandardResultsPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}

# Explicit X-Frame-Options — SecurityHeadersMiddleware also sets this,
# but Django's built-in middleware applies it first as a safety net.
X_FRAME_OPTIONS = "DENY"

# CSRF cookie is readable by JS (not HttpOnly) so the frontend can send
# X-CSRFToken header. The access/refresh JWT cookies remain HttpOnly.
CSRF_COOKIE_HTTPONLY = False
CSRF_COOKIE_SAMESITE = "Lax"

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=int(os.getenv("JWT_ACCESS_MINUTES", "30"))),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=int(os.getenv("JWT_REFRESH_DAYS", "7"))),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
}

CORS_ALLOW_ALL_ORIGINS = str(os.getenv(
    "CORS_ALLOW_ALL_ORIGINS", "False")).strip().lower() == "true"
CORS_ALLOW_CREDENTIALS = str(os.getenv(
    "CORS_ALLOW_CREDENTIALS", "False")).strip().lower() == "true"

CORS_ALLOWED_ORIGINS = [origin.strip() for origin in os.getenv(
    "CORS_ALLOWED_ORIGINS", "").split(",") if origin.strip()]
CSRF_TRUSTED_ORIGINS = [origin.strip() for origin in os.getenv(
    "CSRF_TRUSTED_ORIGINS", "").split(",") if origin.strip()]


CORS_ALLOW_HEADERS = list(default_headers) + [
    "ngrok-skip-browser-warning",
]

CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^http://localhost:\d+$",
    r"^http://127\.0\.0\.1:\d+$",
    r"^https://nxsocial\.nxsys\.in$",
]


# ── Celery: Broker & Result Backend ──────────────────────────────────────────
CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://127.0.0.1:6379/0")
CELERY_RESULT_BACKEND = "django-db"
CELERY_CACHE_BACKEND = "django-cache"

# ── Celery: Serialisation ─────────────────────────────────────────────────────
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = TIME_ZONE

# ── Celery: Time limits ───────────────────────────────────────────────────────
CELERY_TASK_TIME_LIMIT = int(os.getenv("CELERY_TASK_TIME_LIMIT", "300"))
CELERY_TASK_SOFT_TIME_LIMIT = int(os.getenv("CELERY_TASK_SOFT_TIME_LIMIT", "240"))


CELERY_TASK_ACKS_LATE = True
CELERY_WORKER_PREFETCH_MULTIPLIER = 1
CELERY_BROKER_TRANSPORT_OPTIONS = {
    "visibility_timeout": 600,
}

CELERY_RESULT_EXPIRES = 60 * 60 * 24 * 7  # 7 days in seconds

# Track task start time in the result backend.
CELERY_TRACK_STARTED = True

# ── Celery: Beat schedule ─────────────────────────────────────────────────────
CELERY_BEAT_SCHEDULE = {
    "reset-monthly-usage": {
        "task": "billing.tasks.reset_monthly_usage",
        "schedule": crontab(day_of_month=1, hour=0, minute=0),
    },
    "expire-past-due": {
        "task": "billing.tasks.expire_past_due_subscriptions",
        "schedule": crontab(hour=1, minute=0),
    },
    "recover-stuck-pending-posts": {
        "task": "core.tasks.recover_stuck_posts",
        "schedule": crontab(minute="*/5"),
    },
   
    "refresh-expiring-tokens": {
        "task": "core.tasks.refresh_expiring_tokens",
        "schedule": crontab(minute=0, hour="*/6"),
    },
    # Daily cleanup of expired OAuth state records to prevent DB bloat.
    "cleanup-expired-oauth-states": {
        "task": "core.tasks.cleanup_expired_oauth_states",
        "schedule": crontab(hour=2, minute=30),
    },
}

# Database-backed scheduler prevents duplicate task firing on multi-instance deploys.
# The CELERY_BEAT_SCHEDULE entries above are seeded into the DB on first run.
CELERY_BEAT_SCHEDULER = "django_celery_beat.schedulers:DatabaseScheduler"

SOCIAL_REQUEST_TIMEOUT = int(os.getenv("SOCIAL_REQUEST_TIMEOUT", "20"))
SOCIAL_OAUTH_STATE_TTL_SECONDS = int(
    os.getenv("SOCIAL_OAUTH_STATE_TTL_SECONDS", "600"))
SOCIAL_OAUTH_SUCCESS_URL = os.getenv("SOCIAL_OAUTH_SUCCESS_URL")
SOCIAL_OAUTH_ERROR_URL = os.getenv("SOCIAL_OAUTH_ERROR_URL")


LINKEDIN_CLIENT_ID = os.getenv("LINKEDIN_CLIENT_ID", "")
LINKEDIN_CLIENT_SECRET = os.getenv("LINKEDIN_CLIENT_SECRET", "")

META_APP_ID = os.getenv("META_APP_ID", "")
META_APP_SECRET = os.getenv("META_APP_SECRET", "")
META_GRAPH_API_VERSION = os.getenv("META_GRAPH_API_VERSION", "v23.0")

INSTAGRAM_APP_ID = os.getenv("INSTAGRAM_APP_ID", "")
INSTAGRAM_APP_SECRET = os.getenv("INSTAGRAM_APP_SECRET", "")
INSTAGRAM_REDIRECT_URI = os.getenv("INSTAGRAM_REDIRECT_URI", "")


TWITTER_CLIENT_ID = os.getenv("TWITTER_CLIENT_ID", "")
TWITTER_CLIENT_SECRET = os.getenv("TWITTER_CLIENT_SECRET", "")
TWITTER_REDIRECT_URI = os.getenv("TWITTER_REDIRECT_URI", "")
TWITTER_CONSUMER_KEY = os.getenv("TWITTER_CONSUMER_KEY", "")
TWITTER_CONSUMER_SECRET = os.getenv("TWITTER_CONSUMER_SECRET", "")
TWITTER_BEARER_TOKEN = os.getenv("TWITTER_BEARER_TOKEN", "")


YOUTUBE_CLIENT_ID = os.getenv("YOUTUBE_CLIENT_ID", "")
YOUTUBE_CLIENT_SECRET = os.getenv("YOUTUBE_CLIENT_SECRET", "")
YOUTUBE_REDIRECT_URI = os.getenv("YOUTUBE_REDIRECT_URI", "")

THREADS_APP_ID = os.getenv("THREADS_APP_ID", "")
THREADS_APP_SECRET = os.getenv("THREADS_APP_SECRET", "")
THREADS_REDIRECT_URI = os.getenv("THREADS_REDIRECT_URI", "")


LINKEDIN_REDIRECT_URI = os.getenv("LINKEDIN_REDIRECT_URI", "")
SITE_URL = os.getenv("SITE_URL", "").rstrip("/")
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://nxsocial.nxsys.in").rstrip("/")

# ── Email ─────────────────────────────────────────────────────────────────────
# Default: console (safe for dev — prints to stdout).
# Production: set EMAIL_BACKEND=djcelery_email.backends.CeleryEmailBackend in .env
EMAIL_BACKEND = os.getenv("EMAIL_BACKEND", "django.core.mail.backends.console.EmailBackend")
CELERY_EMAIL_BACKEND = os.getenv("CELERY_EMAIL_BACKEND", "django.core.mail.backends.smtp.EmailBackend")
CELERY_EMAIL_TASK_CONFIG = {"max_retries": 3, "default_retry_delay": 30}
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_USE_TLS = str(os.getenv("EMAIL_USE_TLS", "True")).lower() == "true"
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "noreply@nxsocial.nxsys.in")

# ── Field encryption ─────────────────────────────────────────────────────────
# Generate: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
FIELD_ENCRYPTION_KEY = os.getenv("FIELD_ENCRYPTION_KEY", "")
if not SITE_URL and LINKEDIN_REDIRECT_URI:
    from urllib.parse import urlparse
    parsed = urlparse(LINKEDIN_REDIRECT_URI)
    if parsed.scheme and parsed.netloc:
        SITE_URL = f"{parsed.scheme}://{parsed.netloc}"

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

USE_X_FORWARDED_HOST = True
USE_X_FORWARDED_PORT = True


SECURE_SSL_REDIRECT = str(os.getenv(
    "SECURE_SSL_REDIRECT", "False")).strip().lower() == "true"
SESSION_COOKIE_SECURE = str(os.getenv(
    "SESSION_COOKIE_SECURE", "False")).strip().lower() == "true"
CSRF_COOKIE_SECURE = str(os.getenv(
    "CSRF_COOKIE_SECURE", "False")).strip().lower() == "true"
SECURE_HSTS_SECONDS = int(os.getenv("SECURE_HSTS_SECONDS", "0"))
SECURE_HSTS_INCLUDE_SUBDOMAINS = str(os.getenv(
    "SECURE_HSTS_INCLUDE_SUBDOMAINS", "False")).strip().lower() == "true"
SECURE_HSTS_PRELOAD = str(os.getenv(
    "SECURE_HSTS_PRELOAD", "False")).strip().lower() == "true"
SECURE_CONTENT_TYPE_NOSNIFF = True


# Razorpay Configuration
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")
RAZORPAY_WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET", "")


# ── Sentry: error tracking ────────────────────────────────────────────────────
_SENTRY_DSN = os.getenv("SENTRY_DSN", "")
if _SENTRY_DSN:
    try:
        import sentry_sdk
        from sentry_sdk.integrations.django import DjangoIntegration
        from sentry_sdk.integrations.celery import CeleryIntegration
        from sentry_sdk.integrations.redis import RedisIntegration
        sentry_sdk.init(
            dsn=_SENTRY_DSN,
            integrations=[DjangoIntegration(), CeleryIntegration(), RedisIntegration()],
            traces_sample_rate=float(os.getenv("SENTRY_TRACES_RATE", "0.1")),
            profiles_sample_rate=float(os.getenv("SENTRY_PROFILES_RATE", "0.0")),
            send_default_pii=False,
            environment=os.getenv("SENTRY_ENVIRONMENT", "production"),
        )
    except ImportError:
        pass  # sentry-sdk not installed — silently skip


cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)


LOG_DIR = BASE_DIR / "logs"
LOG_DIR.mkdir(exist_ok=True)

_LOG_FORMAT = os.getenv("LOG_FORMAT", "text")  # "json" in production, "text" in dev

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{asctime} {levelname} [{name}] {message}",
            "style": "{",
        },
        "json": {
            "()": "hub.logging.JsonFormatter",
            "datefmt": "%Y-%m-%dT%H:%M:%SZ",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "json" if _LOG_FORMAT == "json" else "verbose",
        },
        "file": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": str(LOG_DIR / "django.log"),
            "maxBytes": 5 * 1024 * 1024,
            "backupCount": 3,
            "formatter": "json" if _LOG_FORMAT == "json" else "verbose",
            "encoding": "utf-8",
        },
    },
    "root": {
        "handlers": ["console", "file"],
        "level": "INFO",
    },
    "loggers": {
        "django.request": {
            "handlers": ["console", "file"],
            "level": "WARNING",
            "propagate": False,
        },
        "django.security": {
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": False,
        },
        "core": {
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": False,
        },
        "billing": {
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": False,
        },
    },
}

# ── OpenAPI documentation (drf-spectacular) ───────────────────────────────────
SPECTACULAR_SETTINGS = {
    "TITLE": "NxSocial API",
    "DESCRIPTION": "Social media management platform — post scheduling, OAuth, analytics.",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "SCHEMA_PATH_PREFIX": r"/api/",
    "COMPONENT_SPLIT_REQUEST": True,
}

