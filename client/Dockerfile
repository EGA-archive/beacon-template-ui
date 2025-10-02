# client/Dockerfile

FROM node:22.19.0-alpine

# set working directory
WORKDIR ./client

# add _/usr/src/app/node_modules/.bin_ to $PATH
ENV PATH /client/node_modules/.bin:$PATH

# install app dependencies
COPY package.json .
COPY yarn.lock .
COPY public ./public
COPY src ./src
COPY backend ./backend

RUN yarn install --production