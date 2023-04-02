FROM node:18.6.0-alpine3.16

WORKDIR /home/app

# Files required by pnpm install
COPY pnpm-lock.yaml ./

RUN apk add curl && npm i -i pnpm && pnpm fetch

ADD . ./

RUN pnpm install -r --offline && pnpm build

ENV PORT=3000
ENV HOST=0.0.0.0

EXPOSE 3000

CMD [ "node", "./dist/server/entry.mjs" ]
