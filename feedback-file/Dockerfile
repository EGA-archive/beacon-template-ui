# client/Dockerfile

FROM node:latest

# set working directory
WORKDIR ./feedback-file

# add _/usr/src/app/node_modules/.bin_ to $PATH
ENV PATH /feedback-file/node_modules/.bin:$PATH

# install app dependencies
COPY package.json .
COPY yarn.lock .
COPY src ./src

RUN yarn install --production