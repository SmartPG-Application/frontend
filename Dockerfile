# Stage 1: Build React
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine AS runner
RUN addgroup -S pgapp && adduser -S pgapp -G pgapp
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
# Set permissions for nginx to run as non-root
RUN chown -R pgapp:pgapp /var/cache/nginx && \
    chown -R pgapp:pgapp /var/log/nginx && \
    chown -R pgapp:pgapp /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R pgapp:pgapp /var/run/nginx.pid
USER pgapp
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
