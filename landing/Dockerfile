FROM denoland/deno:alpine-1.23.0

EXPOSE 3000

WORKDIR /app

# don't run as root
USER deno

# cache the dependencies
COPY deps.ts .
RUN deno cache deps.ts

# copy everything
ADD . .

# compile the app
RUN deno cache main.ts

# run the app with fs read and network permissions
CMD [ "run", "--allow-net", "--allow-read", "main.ts" ]
