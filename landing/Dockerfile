FROM node:18.6.0-alpine3.16

WORKDIR /home/app

RUN apk add curl

RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

# Files required by pnpm install
COPY pnpm-lock.yaml ./

RUN pnpm fetch

ADD . ./

RUN pnpm install -r --offline

RUN pnpm build

EXPOSE 3000
CMD [ "node", "server.mjs" ]
