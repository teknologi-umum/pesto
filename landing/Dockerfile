FROM denoland/deno:alpine-1.23.0

ENV PORT=3000

EXPOSE 3000

WORKDIR /app

RUN apk add curl

# don't run as root
USER deno

# copy everything
ADD . .

# cache the dependencies
RUN deno cache main.ts

# run the app with all permissions, see deno.json for detail
CMD [ "run", "-A", "main.ts" ]
