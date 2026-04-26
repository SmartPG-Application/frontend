FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine AS runner
WORKDIR /app

RUN apk update && \
    apk upgrade && \
    rm -rf /var/cache/apk/*

RUN addgroup -S pgapp && adduser -S pgapp -G pgapp

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

RUN chown -R pgapp:pgapp /usr/share/nginx/html && \
    chown -R pgapp:pgapp /var/cache/nginx && \
    chown -R pgapp:pgapp /var/log/nginx && \
    chown -R pgapp:pgapp /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R pgapp:pgapp /var/run/nginx.pid

USER pgapp

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s \
  CMD wget -qO- http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"] 
