# client/Dockerfile

FROM node:latest

# set working directory
WORKDIR /client

# add node_modules binaries to PATH
ENV PATH /client/node_modules/.bin:$PATH

# copy dependency files first (better caching)
COPY package.json yarn.lock ./

# install ALL deps (needed for build)
RUN yarn install

# copy rest of project
COPY . .

# build React app (creates /build)
RUN yarn build

# expose production port
EXPOSE 3000

# start production server (your Express server)
CMD ["yarn", "serve"]