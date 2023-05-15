FROM node:18.16.0-bullseye-slim

ARG DEBIAN_FRONTEND=noninteractive

WORKDIR /app

COPY . .

RUN apt-get update && \
  apt-get upgrade -y && \
  apt-get install -y coreutils binutils build-essential libseccomp-dev gcc apt-utils curl tar bzip2 gzip && \
  # Make & install nosocket
  make -C ./nosocket/ all && make -C ./nosocket/ install && \
  # Install node dependencies
  npm ci && \
  # Install packages
  node ./scripts/install.cjs && \
  # Register code executor users
  node ./scripts/register-users.cjs && \
  # Build the dist
  npm run build && \
  # Reinstall every dependencies
  rm -rf node_modules && npm ci --omit=dev && \
  # Remove unneeded files for safekeeping
  rm -rf nosocket scripts src tests build.js && \
  # Clear apt related entries
  apt-get autoremove -y && apt-get clean -y && rm -rf /var/lib/apt/lists/*

ENV PORT=50051

ENV NODE_ENV=production

EXPOSE ${PORT}

CMD ["node", "./dist/index.js"]
