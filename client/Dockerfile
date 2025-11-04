# client/Dockerfile

FROM node:latest

# set working directory
WORKDIR ./client

# add _/usr/src/app/node_modules/.bin_ to $PATH
ENV PATH /client/node_modules/.bin:$PATH

# install app dependencies
COPY package.json .
COPY yarn.lock .
COPY public ./public
COPY src ./src
# COPY backend ./backend
COPY .env .
# COPY backend/.env ./backend

RUN yarn install --production