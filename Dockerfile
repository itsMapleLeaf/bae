FROM node:lts-slim

ENV NODE_ENV=production

WORKDIR /app

COPY / /app/

RUN npm i -g pnpm
RUN pnpm install --frozen-lockfile
RUN pnpm build
RUN pnpm install --prod --frozen-lockfile

CMD [ "pnpm", "start" ]
