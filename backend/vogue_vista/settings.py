import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BASE_DIR.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# --- 1. DEVELOPMENT SECURITY SETTINGS ---
DEBUG = os.environ.get("DEBUG", "False") == "True"
SECRET_KEY = os.environ.get("SECRET_KEY")

if not SECRET_KEY:
    if DEBUG:
        SECRET_KEY = "django-insecure-development-default-key-vogue-vista"
    else:
        raise ValueError("SECRET_KEY environment variable is required in production.")

allowed_hosts_raw = os.environ.get("ALLOWED_HOSTS")
if allowed_hosts_raw:
    ALLOWED_HOSTS = [host.strip() for host in allowed_hosts_raw.split(",") if host.strip()]
else:
    ALLOWED_HOSTS = [
        "localhost",
        "127.0.0.1",
        ".onrender.com",
    ]

# --- 2. INSTALLED APPLICATIONS ---
INSTALLED_APPS = [
    'vogue_vista.apps.MongoAdminConfig',
    'vogue_vista.apps.MongoAuthConfig',
    'vogue_vista.apps.MongoContentTypesConfig',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party packages
    'rest_framework',
    'corsheaders',
    
    # Vogue Vista Django Applications
    'accounts',
    'color_analysis',
    'body_analysis',
]

AUTH_USER_MODEL = 'accounts.User'

# --- 3. MIDDLEWARE PIPELINE ---
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    "whitenoise.middleware.WhiteNoiseMiddleware",
]

ROOT_URLCONF = 'vogue_vista.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'vogue_vista.wsgi.application'
ASGI_APPLICATION = 'vogue_vista.asgi.application'

# --- 4. DATABASE CONFIGURATION ---
MONGODB_URI = os.environ.get("MONGODB_URI")

if MONGODB_URI:
    DATABASES = {
        "default": {
            "ENGINE": "django_mongodb_backend",
            "HOST": MONGODB_URI,
            "NAME": os.environ.get("MONGODB_NAME", "vogue_vista"),
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

# --- 5. INTERNATIONALIZATION & ASSETS ---
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'static'

STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"
MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'
if MONGODB_URI:
    DEFAULT_AUTO_FIELD = 'django_mongodb_backend.fields.ObjectIdAutoField'
    MIGRATION_MODULES = {
        'admin': 'mongo_migrations.admin',
        'auth': 'mongo_migrations.auth',
        'contenttypes': 'mongo_migrations.contenttypes',
        'accounts': 'accounts.migrations_mongodb',
        'body_analysis': 'body_analysis.migrations_mongodb',
        'color_analysis': 'color_analysis.migrations_mongodb',
    }
else:
    DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# --- 6. CORS ACCESS ---
CORS_ALLOW_ALL_ORIGINS = True
