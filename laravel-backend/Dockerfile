FROM php:8.3-fpm

# Install comprehensive system dependencies
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

# Install all mandatory PHP extensions for Laravel 11 & MySQL
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd xml zip

# Get the latest version of Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set the container working directory
WORKDIR /var/www

# Copy application files
COPY . /var/www

# Set proper directory ownership BEFORE running composer
RUN chown -R www-data:www-data /var/www

# Run composer installation safely as a production flag
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

# Finalise storage and cache permissions
RUN chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Setup Nginx server block configuration
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

CMD php-fpm -D && nginx -g "daemon off;"
