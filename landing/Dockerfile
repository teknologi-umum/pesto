FROM denoland/deno:alpine-1.23.0

EXPOSE 3000

WORKDIR /app

RUN apk add curl

# don't run as root
USER deno

# cache the dependencies
COPY deps.ts import_map.json deps_lock.json ./
RUN deno cache --reload --lock=deps_lock.json --import-map=import_map.json deps.ts

# copy everything
ADD . .

# compile the app
RUN deno cache main.ts

# run the app with fs read and network permissions, see deno.json for detail
CMD [ "task", "start" ]
