FROM node:18.14.2-bullseye

ARG DEBIAN_FRONTEND=noninteractive

WORKDIR /app

COPY . .

RUN apt-get update && \
  apt-get upgrade -y && \
  apt-get install -y coreutils binutils build-essential libseccomp-dev gcc apt-utils curl tar bzip2 gzip && \
  make -C ./nosocket/ all && make -C ./nosocket/ install && \
  npm ci && \
  node ./scripts/install.cjs && \
  node ./scripts/register-users.cjs && \
  npm run build && \
  rm -rf node_modules && npm ci --omit=dev && \
  apt-get autoremove -y && apt-get clean -y && \
  rm -rf /var/lib/apt/lists/*

ENV PORT=50051

ENV NODE_ENV=production

EXPOSE ${PORT}

CMD ["node", "./dist/index.js"]
