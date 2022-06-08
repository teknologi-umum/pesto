FROM node:16.15-alpine

WORKDIR /home/node/app

COPY . .

RUN npm ci && \
    npm run build

EXPOSE 3000

CMD [ "node", "./node_modules/sirv-cli/bin.js", "--port", "3000", "./dist" ]
