FROM php:8.2-cli-alpine

RUN apk add --no-cache \
        git \
        unzip \
        icu-dev \
        oniguruma-dev \
    && docker-php-ext-install \
        pdo_mysql \
        intl \
        opcache

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/api

EXPOSE 8000

CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]
