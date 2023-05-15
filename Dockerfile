FROM node:20-slim
WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn

COPY src ./src
COPY tsconfig.json ./

ENV NODE_ENV production
RUN yarn build
RUN yarn install

ENV NODE_ENV production
CMD ["node", "--enable-source-maps", "dist/main.js"]
