FROM node:lts-slim

WORKDIR /app

COPY / /app/

RUN npm i -g pnpm
RUN pnpm install --prod --frozen-lockfile

CMD [ "pnpm", "start" ]
