FROM redis:7.0.5-bullseye

COPY redis.conf /home/redis/redis.conf

WORKDIR /data

RUN apt-get update && \
    # Install locales package
    apt-get install -y locales && \
    # Uncomment en_US.UTF-8 for inclusion in generation
    sed -i 's/^# *\(en_US.UTF-8\)/\1/' /etc/locale.gen && \
    # Generate locale
    locale-gen

# Export env vars
ENV LC_ALL=en_US.UTF-8
ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US.UTF-8

CMD ["redis-server", "/home/redis/redis.conf", "--save 60 1", "--loglevel warning"]