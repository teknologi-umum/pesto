FROM node:20.17-alpine

WORKDIR /home/app

ADD . ./

RUN apk add curl && \
    npm i -g pnpm && \
    pnpm fetch && \
    pnpm install -r --offline && \
    pnpm build

ENV PORT=3000
ENV HOST=0.0.0.0

EXPOSE 3000

CMD [ "node", "./dist/server/entry.mjs" ]
