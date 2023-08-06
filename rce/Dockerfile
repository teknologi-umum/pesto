FROM node:18.17.0-bookworm

ARG DEBIAN_FRONTEND=noninteractive

WORKDIR /app

COPY . .

RUN apt-get update && \
  # Update OS dependencies \
  apt-get upgrade -y && \
  apt-get install -y coreutils binutils build-essential libseccomp-dev gcc \
    apt-utils curl tar bzip2 gzip make cmake zip unzip autoconf pkg-config \
    flex perl sed clang libc6-dev libc6 && \
  # Prohibits network access
  make -C ./nosocket/ all && make -C ./nosocket/ install && \
  npm ci && \
  # We install packages here
  node ./scripts/install.cjs && \
  # Remove installed build steps via apt just to lessen the image size more \
  apt-get remove -y bzip2 make cmake zip unzip flex clang gcc g++ apt-utils \
    build-essential && \
  # Create OS users
  node ./scripts/register-users.cjs && \
  # Build the application
  npm run build && \
  # Remove every dependencies, install runtime-only
  rm -rf node_modules && npm ci --omit=dev && \
  apt-get autoremove -y && apt-get clean -y && \
  rm -rf /var/lib/apt/lists/*

ENV PORT=50051

ENV NODE_ENV=production

EXPOSE ${PORT}

CMD ["node", "./dist/index.js"]
