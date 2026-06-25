FROM php:8.3-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    nginx

# Clear apt cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install all PHP extensions required by Laravel 11
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd xml zip

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set container working directory
WORKDIR /var/www

# Copy codebase
COPY . /var/www

# Give permissions to www-data user
RUN chown -R www-data:www-data /var/www

# Run composer installation ignoring local host version requirements
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN composer install \
    --no-dev \
    --optimize-autoloader \
    --no-interaction \
    --no-scripts \
    --ignore-platform-reqs

# Finalise folder execution privileges
RUN chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Setup Nginx configuration
RUN echo 'server { \n\
    listen 8080; \n\
    root /var/www/public; \n\
    index index.php index.html; \n\
    location / { \n\
        try_files $uri $uri/ /index.php?$query_string; \n\
    } \n\
    location ~ \.php$ { \n\
        include fastcgi_params; \n\
        fastcgi_pass 127.0.0.1:9000; \n\
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name; \n\
    } \n\
}' > /etc/nginx/sites-available/default

EXPOSE 8080

# 💡 RUN CLEAR CACHES AT LAUNCH INSTEAD OF BUILD TIME
CMD php artisan config:clear && php artisan cache:clear && php artisan route:clear && php-fpm -D && nginx -g "daemon off;"
