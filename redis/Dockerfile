FROM redis:7.0.5-bullseye

COPY redis.conf /home/redis/redis.conf

WORKDIR /data

CMD ["redis-server", "--save 60 1", "--loglevel warning", "/home/redis/redis.conf"]