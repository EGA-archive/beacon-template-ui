# client/Dockerfile

# --- stage 1: build React app ---

    FROM node:22.19.0 AS build

    # set working directory
    WORKDIR ./client
    
    # add /client/node_modules/.bin to $PATH
    ENV PATH /client/node_modules/.bin:$PATH
    
    # install app dependencies
    COPY package.json .
    COPY yarn.lock .
    COPY public ./public
    COPY src ./src
    # COPY backend ./backend
    COPY auth/* .
    # COPY backend/.env ./backend
    
    RUN yarn install --frozen-lockfile
    
    # create the production build
    RUN yarn build
    
    
    # --- stage 2: serve production app with Nginx ---
    
    FROM nginx:1.27-alpine
    
    # replace default Nginx configuration with ours
    RUN rm -f /etc/nginx/conf.d/default.conf
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    
    # copy the React production build from stage 1
    COPY --from=build /client/build /usr/share/nginx/html
    
    # ensure runtime config directory exists
    RUN mkdir -p /usr/share/nginx/html/config
    
    EXPOSE 80