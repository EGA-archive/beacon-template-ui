
# Stage 1: Build React application
FROM node:22.19.0 AS build

# Set working directory
WORKDIR /client

# Add node_modules binaries to PATH
ENV PATH=/client/node_modules/.bin:$PATH

# Copy application files
COPY package.json .
COPY yarn.lock .
COPY public ./public
COPY src ./src

# Install dependencies
RUN yarn config set network-timeout 600000 -g \
    && yarn install --frozen-lockfile

# Create the production build
RUN yarn build


# Stage 2: Serve production app with Nginx
FROM nginx:1.27-alpine

# Replace the default Nginx configuration
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the React production build
COPY --from=build /client/build /usr/share/nginx/html

# Create the runtime configuration directory
RUN mkdir -p /usr/share/nginx/html/config

EXPOSE 80

# Check container health
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q --spider http://127.0.0.1/health || exit 1
