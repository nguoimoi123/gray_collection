"""
Django settings for backend project.
"""

from pathlib import Path
import os
from decouple import config, Csv
import mongoengine
import certifi

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Ensure OpenSSL can locate trusted CA certificates for outbound TLS (SMTP, HTTPS).
os.environ.setdefault("SSL_CERT_FILE", certifi.where())
os.environ.setdefault("REQUESTS_CA_BUNDLE", certifi.where())
os.environ.setdefault("CURL_CA_BUNDLE", certifi.where())

# --- BẮT ĐẦU CẤU HÌNH TỪ .ENV ---
# Đây là nơi duy nhất các biến môi trường được đọc.

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=False, cast=bool)

# Cho phép truy cập từ các host này
# Production: thay bằng domain thật, ví dụ: ['yourdomain.com', 'api.yourdomain.com']
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=Csv())

# Đọc các API Key
OPENAI_API_KEY = config('OPENAI_API_KEY')
ASTRA_DB_APPLICATION_TOKEN = config('ASTRA_DB_APPLICATION_TOKEN')
ASTRA_API_ENDPOINT = config('ASTRA_API_ENDPOINT')


# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    
    # App của bên thứ ba
    'rest_framework',
    'corsheaders',
    'rest_framework_mongoengine',

    # App của bạn
    'mongoengine',
    'api',
    
    # Cloud lưu ảnh
    'cloudinary',
    'cloudinary_storage',
]

# Cloudinary - đọc credentials từ .env (KHÔNG hardcode trong source code)
import cloudinary

cloudinary.config(
    cloud_name=config('CLOUDINARY_CLOUD_NAME'),
    api_key=config('CLOUDINARY_API_KEY'),
    api_secret=config('CLOUDINARY_API_SECRET'),
)

DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "backend.urls"

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

WSGI_APPLICATION = "backend.wsgi.application"

# Database
# Vẫn giữ lại SQLite cho các bảng mặc định của Django (admin, auth,...)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Kết nối đến MongoDB cho các model của bạn
mongoengine.connect(
    host=config('MONGODB_URI'),
    tls=True,
    tlsCAFile=certifi.where(),  # Sử dụng CA certificates từ certifi thay vì bypass SSL
)


# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

# Internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = "static/"
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Default primary key field type
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Cấu hình CORS - CHỈ cho phép các origin cụ thể (KHÔNG dùng CORS_ALLOW_ALL_ORIGINS)
DEFAULT_CORS_ALLOWED_ORIGINS = (
    "https://fontend-8jcm.onrender.com,"
    "http://localhost:5173,"
    "http://127.0.0.1:5173,"
    "http://localhost:5174,"
    "http://127.0.0.1:5174,"
    "http://localhost:8000,"
    "http://127.0.0.1:8000,"
    "https://vjv1p900-5173.asse.devtunnels.ms,"
    "https://vjv1p900-8000.asse.devtunnels.ms,"
    "https://vjv1p900-5174.asse.devtunnels.ms,"
    "https://grayperfume.com,"
    "https://gray-collection.onrender.com,"
)

CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default=DEFAULT_CORS_ALLOWED_ORIGINS,
    cast=Csv(),
)
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://[a-z0-9-]+-5173\.asse\.devtunnels\.ms$",
    r"^https://[a-z0-9-]+-5174\.asse\.devtunnels\.ms$",
]
CORS_ALLOW_CREDENTIALS = True
SESSION_SAVE_EVERY_REQUEST = True

CSRF_TRUSTED_ORIGINS = config(
    'CSRF_TRUSTED_ORIGINS',
    default=(
        "https://fontend-8jcm.onrender.com,"
        "http://localhost:5173,"
        "http://127.0.0.1:5173,"
        "http://localhost:5174,"
        "http://127.0.0.1:5174,"
        "https://*.asse.devtunnels.ms"
        "https://grayperfume.com",
        "https://gray-collection.onrender.com",
    ),
    cast=Csv(),
)

# Cho phép custom header X-Admin-Key qua CORS
from corsheaders.defaults import default_headers
CORS_ALLOW_HEADERS = list(default_headers) + [
    'x-admin-key',
]

# Bảo mật session cookie
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'
# Production: bật dòng dưới khi có HTTPS
# SESSION_COOKIE_SECURE = True

# Cấu hình Email
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
EMAIL_USE_SSL = config('EMAIL_USE_SSL', default=False, cast=bool)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='support@techhub.com')

# Throttle/Rate limiting cho API
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '60/minute',
        'user': '120/minute',
    },
}

# === BẢO MẬT PRODUCTION ===
# Tự động bật khi DEBUG=False (deploy production)
if not DEBUG:
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_SSL_REDIRECT = True
    SECURE_HSTS_SECONDS = 31536000         # 1 năm
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
