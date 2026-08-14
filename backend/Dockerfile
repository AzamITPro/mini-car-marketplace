# 1. استخدام صورة نظام خفيفة تحتوي على PHP 8.2
FROM php:8.2-cli

# 2. تثبيت الحزم الأساسية ومكتبات الاتصال بـ PostgreSQL
RUN apt-get update && apt-get install -y \
    libpq-dev \
    git \
    unzip \
    && docker-php-ext-install pdo pdo_pgsql

# 3. جلب أداة Composer الرسمية
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 4. تحديد مجلد العمل داخل الحاوية
WORKDIR /var/www

# 5. نسخ ملفات المشروع داخل الحاوية
COPY . .

# 6. تثبيت الحزم والمكتبات تلقائياً
RUN composer install --no-interaction --prefer-dist --optimize-autoloader

# 7. فتح المنفذ 8000 لاستقبال طلبات الـ API
EXPOSE 8000

# 8. أمر تشغيل الخادم الافتراضي
CMD php artisan serve --host=0.0.0.0 --port=8000
