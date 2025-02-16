# 构建阶段
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build

# 生产阶段
FROM nginx:1.24-alpine
WORKDIR /usr/share/nginx/html
COPY --from=builder /app/dist/ .
COPY nginx.conf /etc/nginx/conf.d/default.conf
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q -O /dev/null http://localhost || exit 1
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]