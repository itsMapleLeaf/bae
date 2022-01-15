FROM node:lts-slim

WORKDIR /app

COPY / /app/

RUN npm i -g pnpm

RUN pnpm install --frozen-lockfile
RUN pnpm build

ENV NODE_ENV=production
RUN pnpm install --frozen-lockfile

CMD [ "pnpm", "start" ]
